<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\User;
use App\Traits\LogsAdminActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuperAdminController extends Controller
{
    use LogsAdminActivity;

    private function ensureSuperAdmin(): void
    {
        if (! request()->user()->isSuperAdmin()) {
            abort(403, 'Unauthorized');
        }
    }

    public function admins(): JsonResponse
    {
        $this->ensureSuperAdmin();

        $admins = User::whereIn('role', ['admin', 'super_admin'])
            ->withCount('duesPayments')
            ->latest()
            ->paginate(20);

        return response()->json($admins);
    }

    public function updateAdminRole(Request $request, User $user): JsonResponse
    {
        $this->ensureSuperAdmin();

        $request->validate(['role' => 'required|in:admin,user']);

        if ($user->isSuperAdmin()) {
            return response()->json(['message' => 'Cannot modify a super admin'], 403);
        }

        $oldRole = $user->role;
        $user->update([
            'role' => $request->role,
            'is_admin' => $request->role === 'admin',
        ]);

        $this->logAdminAction('admin_role_updated', "Changed {$user->name} role from {$oldRole} to {$request->role}");

        return response()->json([
            'message' => "{$user->name} is now a ".($request->role === 'admin' ? 'admin' : 'regular user'),
            'user' => $user,
        ]);
    }

    public function deleteAdmin(User $user): JsonResponse
    {
        $this->ensureSuperAdmin();

        if ($user->isSuperAdmin()) {
            return response()->json(['message' => 'Cannot delete a super admin'], 403);
        }

        $name = $user->name;
        $user->update([
            'role' => 'user',
            'is_admin' => false,
        ]);

        $this->logAdminAction('admin_demoted', "Demoted {$name} from admin to user");

        return response()->json(['message' => "{$name} demoted to regular user"]);
    }

    public function activityLogs(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin();

        $query = AdminActivityLog::with('user:id,name');

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->action) {
            $query->where('action', $request->action);
        }

        return response()->json($query->latest()->paginate(50));
    }

    public function promoteToSuperAdmin(User $user): JsonResponse
    {
        $this->ensureSuperAdmin();

        $user->update([
            'role' => 'super_admin',
            'is_admin' => true,
        ]);

        $this->logAdminAction('super_admin_promoted', "Promoted {$user->name} to super admin");

        return response()->json([
            'message' => "{$user->name} is now a super admin",
            'user' => $user,
        ]);
    }
}
