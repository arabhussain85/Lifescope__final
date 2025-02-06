from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

class Role(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='roles')

    def __str__(self):
        return self.name

class EisenhowerMatrix(models.Model):
    URGENCY_CHOICES = [
        ('urgent', 'Urgent'),
        ('not_urgent', 'Not Urgent')
    ]
    IMPORTANCE_CHOICES = [
        ('important', 'Important'),
        ('not_important', 'Not Important') 
    ]
    
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES)
    importance = models.CharField(max_length=13, choices=IMPORTANCE_CHOICES)
    
    class Meta:
        unique_together = ['urgency', 'importance']

    def __str__(self):
        return f"{self.importance} & {self.urgency}"

class TaskCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#000000")  # Hex color code
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='categories')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='task_categories')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role.name})"

    class Meta:
        verbose_name_plural = "Task Categories"

class Task(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed')
    ]
    
    PRIORITY_CHOICES = [
        (1, 'High'),
        (2, 'Medium'),
        (3, 'Low')
    ]

    QUADRANT_CHOICES = [
        ('q1', 'Urgent & Important'),
        ('q2', 'Not Urgent & Important'),
        ('q3', 'Urgent & Not Important'),
        ('q4', 'Not Urgent & Not Important')
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    quadrant = models.CharField(max_length=2, choices=QUADRANT_CHOICES, null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='tasks')
    category = models.ForeignKey(
        TaskCategory,
        on_delete=models.SET_NULL,
        related_name='tasks',
        null=True,
        blank=True,
        default=None
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)
    scheduled_date = models.DateField(null=True, blank=True)
    recurrence = models.CharField(
        max_length=10,
        choices=[
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
        ],
        null=True,
        blank=True
    )

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.status == 'completed' and not self.is_completed:
            self.is_completed = True
            self.completed_at = timezone.now()
        elif self.status != 'completed' and self.is_completed:
            self.is_completed = False
            self.completed_at = None

        # Only create recurring tasks if both recurrence and scheduled_date are set
        if self.recurrence and self.scheduled_date and not self.is_completed:
            try:
                if self.recurrence == 'daily':
                    next_date = self.scheduled_date + timedelta(days=1)
                elif self.recurrence == 'weekly':
                    next_date = self.scheduled_date + timedelta(weeks=1)
                elif self.recurrence == 'monthly':
                    next_date = self.scheduled_date + relativedelta(months=1)
                
                Task.objects.create(
                    title=self.title,
                    description=self.description,
                    status='not_started',
                    priority=self.priority,
                    scheduled_date=next_date,
                    recurrence=self.recurrence,
                    owner=self.owner,
                    role=self.role
                )
            except Exception as e:
                print(f"Error creating recurring task: {e}")
                # Don't prevent saving the original task if recurring creation fails
                pass

        super().save(*args, **kwargs)

    def complete(self):
        self.status = 'completed'
        self.is_completed = True
        self.completed_at = timezone.now()
        self.save()

    def uncomplete(self):
        self.status = 'not_started'
        self.is_completed = False
        self.completed_at = None
        self.save()

class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.task.title}"
