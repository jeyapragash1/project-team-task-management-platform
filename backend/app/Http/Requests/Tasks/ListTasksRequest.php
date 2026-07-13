<?php

namespace App\Http\Requests\Tasks;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListTasksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Task::class) ?? false;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:255'],
            'project_id' => ['sometimes', 'integer', Rule::exists('projects', 'id')->whereNull('deleted_at')],
            'status_id' => ['sometimes', 'integer', Rule::exists('task_statuses', 'id')],
            'assigned_to_id' => ['sometimes', 'integer', Rule::exists('users', 'id')->whereNull('deleted_at')],
            'created_by_id' => ['sometimes', 'integer', Rule::exists('users', 'id')->whereNull('deleted_at')],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'due_from' => ['sometimes', 'date'],
            'due_to' => ['sometimes', 'date', 'after_or_equal:due_from'],
            'trashed' => ['sometimes', Rule::in(['with', 'only'])],
            'sort' => ['sometimes', Rule::in(['title', 'priority', 'progress', 'due_date', 'created_at', 'updated_at'])],
            'direction' => ['sometimes', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}