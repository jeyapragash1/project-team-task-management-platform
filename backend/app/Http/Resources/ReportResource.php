<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'type' => $this->resource['type'],
            'scope' => $this->resource['scope'],
            'filters' => $this->resource['filters'],
            'summary' => $this->resource['summary'],
            'charts' => $this->resource['charts'],
            'table' => $this->resource['table'],
        ];
    }
}