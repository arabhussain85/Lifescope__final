from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta

from .models import Role, EisenhowerMatrix, TaskCategory, Task, TaskComment
from .serializers import (
    RoleSerializer,
    EisenhowerMatrixSerializer, 
    TaskCategorySerializer,
    TaskSerializer,
    TaskCreateUpdateSerializer,
    TaskListSerializer,
    TaskCommentSerializer,
    TaskAnalyticsSerializer
)

class RoleViewSet(viewsets.ModelViewSet):
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Role.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class EisenhowerMatrixViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EisenhowerMatrix.objects.all()
    serializer_class = EisenhowerMatrixSerializer
    permission_classes = [permissions.IsAuthenticated]

class TaskCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = TaskCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TaskCategory.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.filter(owner=self.request.user).select_related('role')
        
        # Apply filters
        role = self.request.query_params.get('role')
        status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        quadrant = self.request.query_params.get('quadrant')

        if role:
            queryset = queryset.filter(role_id=role)
        if status:
            queryset = queryset.filter(status=status)
        if priority:
            queryset = queryset.filter(priority=priority)
        if quadrant:
            queryset = queryset.filter(quadrant=quadrant)

        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        task = self.get_object()
        serializer = TaskCommentSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(task=task, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        task = self.get_object()
        comments = task.comments.all()
        serializer = TaskCommentSerializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def subtasks(self, request, pk=None):
        task = self.get_object()
        subtasks = task.subtasks.all()
        serializer = TaskListSerializer(subtasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        try:
            task = self.get_object()
            if task.is_completed:
                task.uncomplete()
            else:
                task.complete()
            serializer = self.get_serializer(task)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        try:
            tasks = self.get_queryset()
            now = timezone.now()

            # Basic counts
            total_tasks = tasks.count() or 1
            completed_tasks = tasks.filter(is_completed=True).count()
            in_progress = tasks.filter(status='in_progress').count()
            overdue = tasks.filter(
                Q(due_date__lt=now) & 
                Q(is_completed=False)
            ).count()

            # Priority stats
            priority_stats = {
                'high': tasks.filter(priority=1).count(),
                'medium': tasks.filter(priority=2).count(),
                'low': tasks.filter(priority=3).count()
            }

            # Role stats
            role_stats = list(tasks.values('role__name')
                             .annotate(count=Count('id'))
                             .exclude(role__name__isnull=True))

            # Quadrant stats
            quadrant_counts = {
                'q1': tasks.filter(quadrant='q1').count(),
                'q2': tasks.filter(quadrant='q2').count(),
                'q3': tasks.filter(quadrant='q3').count(),
                'q4': tasks.filter(quadrant='q4').count()
            }

            # Calculate percentages
            total_quadrant = sum(quadrant_counts.values()) or 1
            quadrant_percentages = {
                k: round((v / total_quadrant * 100), 1)
                for k, v in quadrant_counts.items()
            }

            # Prepare response data
            response_data = {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'in_progress_tasks': in_progress,
                'overdue_tasks': overdue,
                'completion_rate': round((completed_tasks / total_tasks * 100), 1),
                'by_priority': priority_stats,
                'by_role': role_stats,
                'by_quadrant': quadrant_counts,
                'quadrant_percentages': quadrant_percentages,
                'tasks': TaskListSerializer(tasks, many=True).data  # Use TaskListSerializer instead
            }

            return Response(response_data)

        except Exception as e:
            print(f"Analytics Error: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TaskCommentViewSet(viewsets.ModelViewSet):
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TaskComment.objects.filter(task__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        task = self.get_object()
        serializer = TaskCommentSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(task=task, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        task = self.get_object()
        comments = task.comments.all()
        serializer = TaskCommentSerializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def subtasks(self, request, pk=None):
        task = self.get_object()
        subtasks = task.subtasks.all()
        serializer = TaskListSerializer(subtasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        try:
            task = self.get_object()
            if task.is_completed:
                task.uncomplete()
            else:
                task.complete()
            serializer = self.get_serializer(task)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        try:
            tasks = self.get_queryset()
            now = timezone.now()
            total_tasks = tasks.count() or 1  # Prevent division by zero

            # Calculate quadrant counts
            q1_count = tasks.filter(quadrant='q1').count()
            q2_count = tasks.filter(quadrant='q2').count()
            q3_count = tasks.filter(quadrant='q3').count()
            q4_count = tasks.filter(quadrant='q4').count()

            # Calculate percentages
            total_with_quadrant = max(q1_count + q2_count + q3_count + q4_count, 1)
            q1_percentage = (q1_count / total_with_quadrant * 100)
            q2_percentage = (q2_count / total_with_quadrant * 100)
            q3_percentage = (q3_count / total_with_quadrant * 100)
            q4_percentage = (q4_count / total_with_quadrant * 100)

            completed_tasks = tasks.filter(is_completed=True).count()
            in_progress_tasks = tasks.filter(status='in_progress').count()
            overdue_tasks = tasks.filter(due_date__lt=now, is_completed=False).count()

            analytics_data = {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'in_progress_tasks': in_progress_tasks,
                'overdue_tasks': overdue_tasks,
                'completion_rate': (completed_tasks / total_tasks) * 100,
                'by_priority': {
                    'high': tasks.filter(priority=1).count(),
                    'medium': tasks.filter(priority=2).count(),
                    'low': tasks.filter(priority=3).count(),
                },
                'by_role': tasks.values('role__name').annotate(count=Count('id')),
                'by_quadrant': {
                    'q1': q1_count,
                    'q2': q2_count,
                    'q3': q3_count,
                    'q4': q4_count,
                },
                'quadrant_percentages': {
                    'q1': round(q1_percentage, 1),
                    'q2': round(q2_percentage, 1),
                    'q3': round(q3_percentage, 1),
                    'q4': round(q4_percentage, 1),
                },
                'tasks': TaskSerializer(tasks, many=True).data
            }

            return Response(analytics_data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TaskCommentViewSet(viewsets.ModelViewSet):
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TaskComment.objects.filter(task__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
