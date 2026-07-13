<?php

namespace App\Http\Requests\Tasks;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('assign', $this->route('task')) ?? false;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'assigned_to_id' => ['required', 'integer', Rule::exists('users', 'id')->whereNull('deleted_at')],
        ];
    }
}