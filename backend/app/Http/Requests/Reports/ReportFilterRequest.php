<?php

namespace App\Http\Requests\Reports;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class ReportFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('view-reports');
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'date_from' => ['sometimes', 'date'],
            'date_to' => ['sometimes', 'date', 'after_or_equal:date_from'],
            'project_id' => ['sometimes', 'integer', Rule::exists('projects', 'id')->whereNull('deleted_at')],
            'user_id' => ['sometimes', 'integer', Rule::exists('users', 'id')->whereNull('deleted_at')],
            'task_status_id' => ['sometimes', 'integer', Rule::exists('task_statuses', 'id')],
            'role' => ['sometimes', 'string', 'max:255', Rule::exists('roles', 'name')],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}