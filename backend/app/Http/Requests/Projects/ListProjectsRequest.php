<?php

namespace App\Http\Requests\Projects;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListProjectsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Project::class) ?? false;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(['active', 'on_hold', 'completed', 'cancelled', 'archived'])],
            'manager_id' => ['sometimes', 'integer', Rule::exists('users', 'id')],
            'created_by_id' => ['sometimes', 'integer', Rule::exists('users', 'id')],
            'due_from' => ['sometimes', 'date'],
            'due_to' => ['sometimes', 'date', 'after_or_equal:due_from'],
            'trashed' => ['sometimes', Rule::in(['with', 'only'])],
            'sort' => ['sometimes', Rule::in(['name', 'status', 'start_date', 'due_date', 'created_at', 'updated_at'])],
            'direction' => ['sometimes', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}