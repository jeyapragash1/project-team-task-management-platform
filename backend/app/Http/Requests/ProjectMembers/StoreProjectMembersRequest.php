<?php

namespace App\Http\Requests\ProjectMembers;

use App\Models\ProjectMember;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class StoreProjectMembersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('create', [ProjectMember::class, $this->route('project')]);
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['required', 'integer', 'distinct', Rule::exists('users', 'id')->whereNull('deleted_at')],
        ];
    }
}
