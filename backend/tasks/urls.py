from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'tasks'

router = DefaultRouter()
router.register(r'roles', views.RoleViewSet, basename='role')
router.register(r'eisenhower-matrix', views.EisenhowerMatrixViewSet, basename='eisenhower-matrix')
router.register(r'categories', views.TaskCategoryViewSet, basename='category')
router.register(r'tasks', views.TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
]
