<?php

namespace App\Http\Requests\ProjectMembers;

use App\Models\ProjectMember;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class ListProjectMembersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('viewAny', [ProjectMember::class, $this->route('project')]);
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:255'],
            'role' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
            'sort' => ['sometimes', Rule::in(['id', 'created_at', 'updated_at'])],
            'direction' => ['sometimes', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
