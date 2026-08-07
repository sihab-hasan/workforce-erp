<?php

namespace App\Http\Services;

use App\Models\User;

class UserService
{
    public function getUsers()
    {
        $users = User::with('posts')->get();

        return response()->json($users);
    }
}
