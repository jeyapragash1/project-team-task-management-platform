<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('status', 50)->default('active')->index();
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable()->index();
            $table->foreignId('manager_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('created_by_id')->constrained('users')->restrictOnDelete();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['manager_id', 'status']);
            $table->index('created_by_id');
        });

        DB::statement("ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled'))");
        DB::statement('ALTER TABLE projects ADD CONSTRAINT projects_date_order_check CHECK (due_date IS NULL OR start_date IS NULL OR due_date >= start_date)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};