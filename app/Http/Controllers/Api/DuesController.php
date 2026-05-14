<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DuesPayment;
use App\Models\Pledge;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DuesController extends Controller
{
    public function overview(): JsonResponse
    {
        $user = request()->user();

        $totalPaid = DuesPayment::where('user_id', $user->id)
            ->where('status', 'approved')
            ->sum('amount');

        $pendingAmount = DuesPayment::where('user_id', $user->id)
            ->where('status', 'pending')
            ->sum('amount');

        $activePledges = Pledge::where('user_id', $user->id)
            ->where('status', 'active')
            ->sum('amount');

        $lastPayment = DuesPayment::where('user_id', $user->id)
            ->where('status', 'approved')
            ->latest()
            ->first();

        $recentPayments = DuesPayment::where('user_id', $user->id)
            ->with('admin:id,name')
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'card_code' => $user->dues_card_code,
            'card_issued_at' => $user->dues_card_issued_at,
            'is_member' => $user->is_member,
            'total_paid' => (float) $totalPaid,
            'pending_amount' => (float) $pendingAmount,
            'active_pledges_total' => (float) $activePledges,
            'last_paid_at' => $lastPayment?->created_at,
            'last_paid_amount' => $lastPayment ? (float) $lastPayment->amount : null,
            'recent_payments' => $recentPayments,
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        $payments = DuesPayment::where('user_id', $request->user()->id)
            ->with('admin:id,name')
            ->latest()
            ->paginate(20);

        return response()->json($payments);
    }

    public function statement(): JsonResponse
    {
        $user = request()->user();

        $payments = DuesPayment::where('user_id', $user->id)
            ->where('status', 'approved')
            ->with('admin:id,name')
            ->oldest()
            ->get();

        $runningBalance = 0;
        $paymentsWithBalance = $payments->map(function ($p) use (&$runningBalance) {
            $runningBalance += (float) $p->amount;
            $p->running_balance = (float) $runningBalance;

            return $p;
        });

        return response()->json([
            'payments' => $paymentsWithBalance,
            'total' => (float) $runningBalance,
        ]);
    }

    public function statementPdf()
    {
        $user = request()->user();

        $payments = DuesPayment::where('user_id', $user->id)
            ->where('status', 'approved')
            ->with('admin:id,name')
            ->oldest()
            ->get();

        $runningBalance = 0;
        $paymentsWithBalance = $payments->map(function ($p) use (&$runningBalance) {
            $runningBalance += (float) $p->amount;

            return [
                'date' => $p->created_at->format('d M Y'),
                'type' => ucfirst($p->type),
                'reference' => $p->reference_number ?? '—',
                'period' => $p->period_coverage ?? '—',
                'method' => $p->payment_method ?? '—',
                'amount' => number_format((float) $p->amount, 2),
                'balance' => number_format($runningBalance, 2),
            ];
        });

        $html = '
        <style>
            body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #333; }
            h1 { font-size: 18px; text-align: center; color: #7c3aed; margin-bottom: 4px; }
            .subtitle { text-align: center; color: #666; font-size: 11px; margin-bottom: 20px; }
            .info { margin-bottom: 16px; padding: 10px; background: #f5f3ff; border-radius: 6px; }
            .info table { width: 100%; font-size: 10px; }
            .info td { padding: 2px 6px; }
            table.wide { width: 100%; border-collapse: collapse; }
            table.wide th { background: #7c3aed; color: #fff; padding: 6px 8px; text-align: left; font-size: 9px; text-transform: uppercase; }
            table.wide td { padding: 5px 8px; border-bottom: 1px solid #eee; }
            table.wide tr:nth-child(even) td { background: #fafafa; }
            .total-row td { font-weight: bold; border-top: 2px solid #333; padding-top: 8px; }
            .footer { text-align: center; color: #999; font-size: 8px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
        <h1>📄 Payment Statement</h1>
        <p class="subtitle">YouthFaith &mdash; Dues &amp; Contributions</p>
        <div class="info">
            <table>
                <tr><td><strong>Member:</strong> '.e($user->name).'</td><td><strong>Card Code:</strong> '.e($user->dues_card_code ?? 'N/A').'</td></tr>
                <tr><td><strong>Email:</strong> '.e($user->email).'</td><td><strong>Generated:</strong> '.now()->format('d M Y').'</td></tr>
            </table>
        </div>
        <table class="wide">
            <thead>
                <tr><th>#</th><th>Date</th><th>Type</th><th>Reference</th><th>Period</th><th>Method</th><th style="text-align:right">Amount</th><th style="text-align:right">Balance</th></tr>
            </thead>
            <tbody>';

        foreach ($paymentsWithBalance as $i => $p) {
            $html .= '<tr>
                <td>'.($i + 1).'</td>
                <td>'.$p['date'].'</td>
                <td>'.$p['type'].'</td>
                <td>'.$p['reference'].'</td>
                <td>'.$p['period'].'</td>
                <td>'.$p['method'].'</td>
                <td style="text-align:right">₵'.$p['amount'].'</td>
                <td style="text-align:right">₵'.$p['balance'].'</td>
            </tr>';
        }

        $total = number_format($runningBalance, 2);
        $html .= '
                <tr class="total-row">
                    <td colspan="6" style="text-align:right">Total</td>
                    <td style="text-align:right;color:#059669">₵'.$total.'</td>
                    <td style="text-align:right;color:#2563eb">₵'.$total.'</td>
                </tr>
            </tbody>
        </table>
        <p class="footer">Statement generated by YouthFaith &bull; '.now()->format('d M Y H:i').'</p>';

        return Pdf::loadHTML($html)->download('statement-'.now()->format('Y-m-d').'.pdf');
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:dues,contribution,pledge',
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'period_coverage' => 'nullable|string|max:50',
            'proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'notes' => 'nullable|string|max:500',
        ]);

        $path = $request->file('proof')->store('dues-proofs', 'public');

        $payment = DuesPayment::create([
            'user_id' => $request->user()->id,
            'amount' => $request->amount,
            'type' => $request->type,
            'payment_method' => $request->payment_method,
            'reference_number' => $request->reference_number,
            'period_coverage' => $request->period_coverage,
            'proof_path' => $path,
            'status' => 'pending',
            'notes' => $request->notes,
        ]);

        return response()->json($payment, 201);
    }

    public function pledges(): JsonResponse
    {
        $pledges = Pledge::where('user_id', request()->user()->id)
            ->latest()
            ->get();

        return response()->json($pledges);
    }

    public function storePledge(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'due_date' => 'nullable|date|after:today',
        ]);

        $pledge = Pledge::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'amount' => $request->amount,
            'due_date' => $request->due_date,
            'status' => 'active',
        ]);

        return response()->json($pledge, 201);
    }

    public function cancelPledge(Pledge $pledge): JsonResponse
    {
        if ($pledge->user_id !== request()->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $pledge->update(['status' => 'cancelled']);

        return response()->json($pledge);
    }
}
