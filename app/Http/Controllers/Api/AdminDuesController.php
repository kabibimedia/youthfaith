<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DuesPayment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDuesController extends Controller
{
    private function ensureAdmin(): void
    {
        if (! request()->user()->is_admin) {
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
}
