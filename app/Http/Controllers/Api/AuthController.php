<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'surname' => 'required|string|max:255',
            'firstname' => 'required|string|max:255',
            'othername' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'date_of_birth' => 'nullable|date|before:today',
            'location' => 'nullable|string|max:255',
            'password' => 'required|string|min:8|confirmed',
            'is_member' => 'boolean',
            'has_dues_card' => 'boolean',
            'dues_card_code' => 'nullable|string|size:5|unique:users,dues_card_code',
            'registration_photo' => 'required|file|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $fullName = trim(implode(' ', array_filter([$request->surname, $request->firstname, $request->othername])));

        $data = [
            'name' => $fullName,
            'surname' => $request->surname,
            'firstname' => $request->firstname,
            'othername' => $request->othername,
            'username' => $request->username,
            'email' => $request->email,
            'date_of_birth' => $request->date_of_birth,
            'location' => $request->location,
            'password' => $request->password,
            'is_member' => $request->boolean('is_member'),
            'has_dues_card' => $request->boolean('has_dues_card'),
        ];

        if ($request->hasFile('registration_photo')) {
            $data['registration_photo'] = $request->file('registration_photo')->store('registration-photos', 'public');
        }

        if ($request->has_dues_card && $request->dues_card_code) {
            $data['dues_card_code'] = strtoupper($request->dues_card_code);
            $data['dues_card_issued_at'] = now();
        } elseif (! $request->has_dues_card) {
            $data['dues_card_code'] = $this->generateDuesCode();
            $data['dues_card_issued_at'] = now();
        }

        $user = User::create($data);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login' => 'required',
            'password' => 'required',
        ]);

        $login = $request->login;
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($field, $login)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->update(['last_active_at' => now()]);
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function adminLogin(Request $request): JsonResponse
    {
        $request->validate([
            'login' => 'required',
            'password' => 'required',
        ]);

        $login = $request->login;
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($field, $login)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_admin) {
            throw ValidationException::withMessages([
                'login' => ['You do not have admin access.'],
            ]);
        }

        $user->update(['last_active_at' => now()]);
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    private function generateDuesCode(): string
    {
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        do {
            $code = '';
            for ($i = 0; $i < 5; $i++) {
                $code .= $characters[random_int(0, strlen($characters) - 1)];
            }
        } while (User::where('dues_card_code', $code)->exists());

        return $code;
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
