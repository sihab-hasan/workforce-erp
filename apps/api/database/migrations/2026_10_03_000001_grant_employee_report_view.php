<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $permissionId = DB::table('permissions')->where('name', 'report.view')->value('id');
        if (! $permissionId) {
            return;
        }

        $roleIds = DB::table('roles')->where('name', 'employee')->pluck('id');
        foreach ($roleIds as $roleId) {
            $exists = DB::table('role_permissions')
                ->where('role_id', $roleId)
                ->where('permission_id', $permissionId)
                ->exists();
            if (! $exists) {
                DB::table('role_permissions')->insert([
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                ]);
            }
        }
    }

    public function down(): void
    {
        $permissionId = DB::table('permissions')->where('name', 'report.view')->value('id');
        $roleIds = DB::table('roles')->where('name', 'employee')->pluck('id');
        DB::table('role_permissions')->whereIn('role_id', $roleIds)->where('permission_id', $permissionId)->delete();
    }
};
