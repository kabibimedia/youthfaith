<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DuesCardRequest;
use App\Models\DuesPayment;
use App\Models\User;
use App\Traits\LogsAdminActivity;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDuesController extends Controller
{
    use LogsAdminActivity;

    private function ensureAdmin(): void
    {
        if (! request()->user()->isAdmin()) {
            abort(403, 'Unauthorized');
        }
    }

    public function payments(Request $request): JsonResponse
    {
        $this->ensureAdmin();

        $query = DuesPayment::with(['user:id,name,dues_card_code', 'admin:id,name']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function approve(DuesPayment $payment): JsonResponse
    {
        $this->ensureAdmin();

        $payment->update([
            'status' => 'approved',
            'admin_id' => request()->user()->id,
        ]);

        $this->logAdminAction('dues_payment_approved', "Payment #{$payment->id} of ₵{$payment->amount} by {$payment->user?->name}");

        return response()->json($payment->load(['user:id,name', 'admin:id,name']));
    }

    public function reject(Request $request, DuesPayment $payment): JsonResponse
    {
        $this->ensureAdmin();

        $request->validate(['notes' => 'nullable|string|max:500']);

        $payment->update([
            'status' => 'rejected',
            'admin_id' => request()->user()->id,
            'notes' => $request->notes,
        ]);

        $this->logAdminAction('dues_payment_rejected', "Payment #{$payment->id} of ₵{$payment->amount} by {$payment->user?->name}");

        return response()->json($payment->load(['user:id,name', 'admin:id,name']));
    }

    public function uploadPayment(Request $request): JsonResponse
    {
        $this->ensureAdmin();

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:dues,contribution,pledge',
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'period_coverage' => 'nullable|string|max:50',
            'proof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $data = [
            'user_id' => $request->user_id,
            'amount' => $request->amount,
            'type' => $request->type,
            'payment_method' => $request->payment_method,
            'reference_number' => $request->reference_number,
            'period_coverage' => $request->period_coverage,
            'status' => 'approved',
            'admin_id' => request()->user()->id,
        ];

        if ($request->hasFile('proof')) {
            $data['proof_path'] = $request->file('proof')->store('dues-proofs', 'public');
        }

        $payment = DuesPayment::create($data);

        $this->logAdminAction('dues_payment_uploaded', "Payment #{$payment->id} of ₵{$payment->amount} for {$payment->user?->name}");

        return response()->json($payment->load('user:id,name'), 201);
    }

    public function members(Request $request): JsonResponse
    {
        $this->ensureAdmin();

        $query = User::where('is_member', true)->orWhere('has_dues_card', true);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('dues_card_code', 'like', "%{$request->search}%");
            });
        }

        $members = $query->withCount(['duesPayments as total_paid' => function ($q) {
            $q->where('status', 'approved')->selectRaw('COALESCE(sum(amount), 0)');
        }])->latest()->paginate(20);

        return response()->json($members);
    }

    public function exportPayments(Request $request)
    {
        $this->ensureAdmin();

        $query = DuesPayment::with(['user:id,name,dues_card_code', 'admin:id,name']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        $payments = $query->oldest()->get();

        if ($request->format === 'pdf') {
            $rows = '';
            foreach ($payments as $i => $p) {
                $rows .= '<tr>
                    <td>'.($i + 1).'</td>
                    <td>'.e($p->user?->name ?? 'Unknown').'</td>
                    <td>'.e($p->user?->dues_card_code ?? '').'</td>
                    <td>'.number_format((float) $p->amount, 2).'</td>
                    <td>'.ucfirst($p->type).'</td>
                    <td>'.e($p->payment_method ?? '').'</td>
                    <td>'.e($p->reference_number ?? '').'</td>
                    <td>'.e($p->period_coverage ?? '').'</td>
                    <td>'.$p->status.'</td>
                    <td>'.$p->created_at->format('d M Y').'</td>
                    <td>'.e($p->admin?->name ?? '').'</td>
                </tr>';
            }

            $html = '
            <style>
                body { font-family: DejaVu Sans, sans-serif; font-size: 9px; color: #333; }
                h1 { font-size: 18px; text-align: center; color: #7c3aed; margin-bottom: 4px; }
                .subtitle { text-align: center; color: #666; font-size: 11px; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th { background: #7c3aed; color: #fff; padding: 5px 6px; text-align: left; font-size: 8px; text-transform: uppercase; }
                td { padding: 4px 6px; border-bottom: 1px solid #eee; }
                tr:nth-child(even) td { background: #fafafa; }
                .footer { text-align: center; color: #999; font-size: 8px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
            <h1>📄 Dues Payments Report</h1>
            <p class="subtitle">YouthFaith &mdash; Admin Export</p>
            <table>
                <thead>
                    <tr><th>#</th><th>Member</th><th>Card</th><th>Amount</th><th>Type</th><th>Method</th><th>Reference</th><th>Period</th><th>Status</th><th>Date</th><th>Processed By</th></tr>
                </thead>
                <tbody>'.$rows.'</tbody>
            </table>
            <p class="footer">Generated by YouthFaith Admin &bull; '.now()->format('d M Y H:i').'</p>';

            return Pdf::loadHTML($html)->download('dues-payments-'.now()->format('Y-m-d').'.pdf');
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="dues-payments-'.now()->format('Y-m-d').'.csv"',
        ];

        $callback = function () use ($payments) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['#', 'Member Name', 'Card Code', 'Amount (GHS)', 'Type', 'Payment Method', 'Reference Number', 'Period Coverage', 'Status', 'Date', 'Processed By', 'Notes']);

            foreach ($payments as $i => $p) {
                fputcsv($handle, [
                    $i + 1,
                    $p->user?->name ?? 'Unknown',
                    $p->user?->dues_card_code ?? '',
                    number_format((float) $p->amount, 2),
                    ucfirst($p->type),
                    $p->payment_method ?? '',
                    $p->reference_number ?? '',
                    $p->period_coverage ?? '',
                    $p->status,
                    $p->created_at->format('Y-m-d H:i'),
                    $p->admin?->name ?? '',
                    $p->notes ?? '',
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function generateCodes(Request $request): JsonResponse
    {
        $this->ensureAdmin();

        $request->validate(['count' => 'nullable|integer|min:1|max:100']);

        $count = $request->count ?? 10;
        $codes = [];

        for ($i = 0; $i < $count; $i++) {
            $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            do {
                $code = '';
                for ($j = 0; $j < 5; $j++) {
                    $code .= $characters[random_int(0, strlen($characters) - 1)];
                }
            } while (User::where('dues_card_code', $code)->exists());

            $codes[] = $code;
        }

        return response()->json(['codes' => $codes]);
    }

    public function generateCodesForUsers(Request $request): JsonResponse
    {
        $this->ensureAdmin();

        $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        $users = User::whereIn('id', $request->user_ids)->get();
        $results = [];

        foreach ($users as $user) {
            $code = $this->generateCardCode();
            $user->update([
                'has_dues_card' => true,
                'dues_card_code' => $code,
                'dues_card_status' => 'verified',
                'dues_card_issued_at' => now(),
            ]);
            $results[] = [
                'id' => $user->id,
                'name' => $user->name,
                'dues_card_code' => $code,
            ];
        }

        $this->logAdminAction('dues_codes_generated', count($results).' code(s) assigned to users: '.implode(', ', array_column($results, 'name')));

        return response()->json([
            'message' => count($results).' code(s) generated and assigned.',
            'results' => $results,
        ]);
    }

    public function cardRequests(): JsonResponse
    {
        $this->ensureAdmin();

        $requests = DuesCardRequest::with('user')
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return response()->json($requests);
    }

    public function approveCardRequest(int $id): JsonResponse
    {
        $this->ensureAdmin();

        $cardRequest = DuesCardRequest::findOrFail($id);
        $cardRequest->update([
            'status' => 'approved',
            'admin_id' => request()->user()->id,
        ]);

        $user = $cardRequest->user;
        $user->update([
            'has_dues_card' => true,
            'dues_card_code' => $this->generateCardCode(),
            'dues_card_issued_at' => now(),
            'dues_card_status' => 'verified',
        ]);

        $this->logAdminAction('card_request_approved', "Card request #{$id} approved for {$user->name}, code: {$user->dues_card_code}");

        return response()->json([
            'message' => 'Card request approved. Code assigned: '.$user->dues_card_code,
            'request' => $cardRequest->fresh(),
        ]);
    }

    public function rejectCardRequest(int $id, Request $request): JsonResponse
    {
        $this->ensureAdmin();

        $request->validate(['notes' => 'nullable|string|max:500']);

        $cardRequest = DuesCardRequest::findOrFail($id);
        $cardRequest->update([
            'status' => 'rejected',
            'admin_id' => request()->user()->id,
            'admin_notes' => $request->notes,
        ]);

        $this->logAdminAction('card_request_rejected', "Card request #{$id} rejected for {$cardRequest->user?->name}");

        return response()->json([
            'message' => 'Card request rejected.',
            'request' => $cardRequest->fresh(),
        ]);
    }

    public function verifyUserCard(Request $request): JsonResponse
    {
        $this->ensureAdmin();

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'required|in:verified,rejected',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = User::findOrFail($request->user_id);
        $user->update(['dues_card_status' => $request->status]);

        $this->logAdminAction('user_card_verified', "User {$user->name} card status set to {$request->status}");

        return response()->json([
            'message' => 'User card status updated to '.$request->status,
            'user' => $user,
        ]);
    }

    public function pendingVerifications(): JsonResponse
    {
        $this->ensureAdmin();

        $users = User::where('dues_card_status', 'pending')
            ->whereNotNull('dues_card_code')
            ->where('is_member', true)
            ->withCount('duesPayments')
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    private function generateCardCode(): string
    {
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        do {
            $code = '';
            for ($j = 0; $j < 5; $j++) {
                $code .= $characters[random_int(0, strlen($characters) - 1)];
            }
        } while (User::where('dues_card_code', $code)->exists());

        return $code;
    }
}
