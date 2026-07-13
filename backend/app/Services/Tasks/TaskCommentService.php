<?php

namespace App\Services\Tasks;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TaskCommentService
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginate(Task $task, array $filters): LengthAwarePaginator
    {
        $sort = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'asc';
        $perPage = (int) ($filters['per_page'] ?? 15);

        return TaskComment::query()
            ->whereBelongsTo($task)
            ->with(['user.roles'])
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(Task $task, User $actor, array $data): TaskComment
    {
        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $actor->id,
            'body' => $data['body'],
        ]);

        return $comment->load(['task.status', 'user.roles']);
    }

    public function getTaskComment(Task $task, TaskComment $taskComment): TaskComment
    {
        $this->ensureCommentBelongsToTask($task, $taskComment);

        return $taskComment->load(['task.status', 'user.roles']);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(Task $task, TaskComment $taskComment, array $data): TaskComment
    {
        $this->ensureCommentBelongsToTask($task, $taskComment);

        $taskComment->forceFill([
            'body' => $data['body'],
        ])->save();

        return $taskComment->refresh()->load(['task.status', 'user.roles']);
    }

    public function delete(Task $task, TaskComment $taskComment): void
    {
        $this->ensureCommentBelongsToTask($task, $taskComment);

        $taskComment->delete();
    }

    private function ensureCommentBelongsToTask(Task $task, TaskComment $taskComment): void
    {
        if ((int) $taskComment->task_id !== (int) $task->id) {
            throw (new ModelNotFoundException())->setModel(TaskComment::class, [$taskComment->id]);
        }
    }
}