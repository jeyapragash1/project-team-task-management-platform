<?php

namespace App\Http\Requests\TaskComments;

use App\Models\TaskComment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class ListTaskCommentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('viewAny', [TaskComment::class, $this->route('task')]);
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'sort' => ['sometimes', Rule::in(['created_at', 'updated_at'])],
            'direction' => ['sometimes', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}