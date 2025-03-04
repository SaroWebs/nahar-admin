<?php

namespace App\Models;

use App\Models\Post;
use Illuminate\Database\Eloquent\Model;

class PostImage extends Model
{
    protected $guarded=[];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
