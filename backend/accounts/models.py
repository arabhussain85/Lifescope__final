from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """Custom user model for authentication"""
    email = models.EmailField(_('email address'), unique=True)
    is_email_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, blank=True, null=True)
    reset_password_token = models.CharField(max_length=100, blank=True, null=True)
    token_expiry = models.DateTimeField(null=True, blank=True)
    
    # Make email the required field for login instead of username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        app_label = 'accounts'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email

class LoginHistory(models.Model):
    """Track user login attempts"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history')
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    success = models.BooleanField(default=False)
    
    class Meta:
        app_label = 'accounts'
        verbose_name_plural = "Login Histories"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.email} - {self.timestamp}"
