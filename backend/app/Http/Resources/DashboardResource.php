<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'role' => $this->resource['role'],
            'scope' => $this->resource['scope'],
            'statistics' => $this->resource['statistics'],
            'tasks_by_status' => $this->resource['tasks_by_status'],
            'recent_activity' => ActivityLogResource::collection($this->resource['recent_activity'])->resolve(),
        ];
    }
}