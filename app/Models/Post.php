<?php

namespace App\Models;

use App\Models\PostImage;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $guarded=[];

    public function images()
    {
        return $this->hasMany(PostImage::class);
    }
}
