from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
import uuid
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    UserSerializer,
    LoginHistorySerializer,
    UserUpdateSerializer
)
from .models import LoginHistory

User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': serializer.data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

class VerifyEmailView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, token):
        try:
            user = User.objects.get(verification_token=token)
            user.is_email_verified = True
            user.verification_token = None
            user.save()
            return Response({'detail': 'Email verified successfully'})
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid verification token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UpdateProfileView(generics.UpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserUpdateSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response(
                {'detail': 'Invalid old password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password changed successfully'})

class ResetPasswordRequestView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = str(uuid.uuid4())
            user.reset_password_token = token
            user.save()

            reset_url = f"{request.build_absolute_uri('/accounts/reset-password/')}{token}/"
            send_mail(
                'Reset your password',
                f'Click this link to reset your password: {reset_url}',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            return Response({'detail': 'Password reset email sent'})
        except User.DoesNotExist:
            return Response(
                {'detail': 'User with this email does not exist'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, token):
        try:
            user = User.objects.get(reset_password_token=token)
            new_password = request.data.get('new_password')
            user.set_password(new_password)
            user.reset_password_token = None
            user.save()
            return Response({'detail': 'Password reset successful'})
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid reset token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
