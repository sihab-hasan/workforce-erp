<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id', 'branch_id', 'uploaded_by', 'name', 'category', 'description',
        'disk', 'path', 'mime_type', 'size_bytes', 'version',
    ];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function branch() { return $this->belongsTo(Branch::class); }
    public function uploader() { return $this->belongsTo(User::class, 'uploaded_by'); }
}
