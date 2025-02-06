from django.contrib import admin
from .models import Role, EisenhowerMatrix, TaskCategory, Task, TaskComment

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at',)

@admin.register(EisenhowerMatrix)
class EisenhowerMatrixAdmin(admin.ModelAdmin):
    list_display = ('urgency', 'importance')

@admin.register(TaskCategory)
class TaskCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'owner', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('role', 'created_at')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'priority', 'due_date', 'owner', 'role')
    search_fields = ('title', 'description')
    list_filter = ('status', 'priority', 'role', 'category')
    date_hierarchy = 'due_date'

@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'author', 'created_at')
    search_fields = ('content',)
    list_filter = ('created_at',)
