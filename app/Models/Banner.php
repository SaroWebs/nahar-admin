<?php

namespace App\Models;

use App\Models\PostImage;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $guarded=[];
    public function images()
    {
        return $this->hasMany(PostImage::class, 'post_id');
    }
}
