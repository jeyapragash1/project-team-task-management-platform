<?php

namespace App\Http\Requests\TaskComments;

use App\Models\TaskComment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class StoreTaskCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('create', [TaskComment::class, $this->route('task')]);
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:5000'],
        ];
    }
}