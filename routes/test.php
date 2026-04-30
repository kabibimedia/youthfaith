<?php

use Illuminate\Support\Facades\Route;

Route::get('/test-page', function () {
    return view('welcome');
});
