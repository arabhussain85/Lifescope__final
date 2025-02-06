from rest_framework import serializers
from .models import Role, EisenhowerMatrix, TaskCategory, Task, TaskComment
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['created_at']

class EisenhowerMatrixSerializer(serializers.ModelSerializer):
    class Meta:
        model = EisenhowerMatrix
        fields = ['id', 'urgency', 'importance']

class TaskCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskCategory
        fields = ['id', 'name', 'description', 'color', 'role', 'created_at']
        read_only_fields = ['created_at']

class TaskCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'author', 'author_name', 'content', 'created_at']
        read_only_fields = ['author', 'created_at']

class TaskSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    category_name = serializers.SerializerMethodField()
    comments = TaskCommentSerializer(many=True, read_only=True)
    is_completed = serializers.BooleanField(read_only=True)

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'due_date', 'role', 'category', 'quadrant',
            'estimated_hours', 'actual_hours', 'created_at',
            'updated_at', 'is_completed', 'role_name', 'comments',
            'category_name'
        ]
        read_only_fields = ['completed_at', 'created_at', 'updated_at', 'is_completed']

class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'status', 'priority', 
            'due_date', 'role', 'category', 'quadrant',
            'estimated_hours', 'actual_hours'
        ]
        extra_kwargs = {
            'quadrant': {'required': False, 'allow_null': True},
            'due_date': {'required': False, 'allow_null': True},
            'description': {'required': False, 'allow_null': True},
            'scheduled_date': {'required': False, 'allow_null': True},
            'recurrence': {'required': False, 'allow_null': True},
            'estimated_hours': {'required': False},
            'actual_hours': {'required': False},
        }

    def validate(self, data):
        # Ensure required fields are present
        if not data.get('title'):
            raise serializers.ValidationError({'title': 'Title is required'})
        if not data.get('role'):
            raise serializers.ValidationError({'role': 'Role is required'})
        
        # Convert string values to appropriate types if needed
        if 'priority' in data and isinstance(data['priority'], str):
            try:
                data['priority'] = int(data['priority'])
            except (ValueError, TypeError):
                raise serializers.ValidationError({'priority': 'Invalid priority value'})
        
        return data

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        if validated_data.get('status') == 'completed':
            validated_data['is_completed'] = True
            validated_data['completed_at'] = timezone.now()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'status' in validated_data:
            if validated_data['status'] == 'completed':
                validated_data['is_completed'] = True
                validated_data['completed_at'] = timezone.now()
            else:
                validated_data['is_completed'] = False
                validated_data['completed_at'] = None
        return super().update(instance, validated_data)

class TaskListSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    category_name = serializers.SerializerMethodField()
    is_completed = serializers.BooleanField(read_only=True)

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'due_date', 'role', 'category', 'quadrant',
            'estimated_hours', 'actual_hours', 'created_at',
            'updated_at', 'is_completed', 'role_name', 'category_name'
        ]

class TaskAnalyticsSerializer(serializers.Serializer):
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    in_progress_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    avg_completion_time = serializers.DurationField(allow_null=True)
    by_priority = serializers.DictField()
    by_role = serializers.ListField()
    by_category = serializers.ListField()
    by_quadrant = serializers.DictField()
    quadrant_percentages = serializers.DictField()

