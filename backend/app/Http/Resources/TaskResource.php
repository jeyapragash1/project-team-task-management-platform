<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'status_id' => $this->status_id,
            'assigned_to_id' => $this->assigned_to_id,
            'created_by_id' => $this->created_by_id,
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority,
            'progress' => $this->progress,
            'due_date' => $this->due_date,
            'completed_at' => $this->completed_at,
            'project' => new ProjectResource($this->whenLoaded('project')),
            'status' => new TaskStatusResource($this->whenLoaded('status')),
            'assignee' => new UserResource($this->whenLoaded('assignee')),
            'creator' => new UserResource($this->whenLoaded('creator')),
            'comments_count' => $this->whenCounted('comments'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->whenNotNull($this->deleted_at),
        ];
    }
}