from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core import views  
from core.views import (
    register_user,
    login_view,
    dashboard_view,
    bulk_upload_students,
    save_seating_plan,   
    get_seating_plans,    
    StudentViewSet, 
    RoomViewSet, 
    ExamSessionViewSet
)

# 1. REST Framework ke ViewSets ke liye router setup
router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'exams', ExamSessionViewSet, basename='exam')

# 2. Main URL Patterns
urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth APIs
    path('api/register/', register_user),
    path('api/login/', login_view, name='api-login'),
    
    # Dashboard & Bulk Upload
    path('api/dashboard/', dashboard_view, name='api-dashboard'),
    path('api/students/bulk-upload/', bulk_upload_students, name='api-bulk-upload'),
    
    # 🔥 Naye URLs: Seating Plan ke liye
    path('api/save-plan/', save_seating_plan, name='api-save-plan'),
    path('api/seating-plans/', get_seating_plans, name='api-get-plans'),
    
    # CRUD API Routes
    path('api/', include(router.urls)),
    # urls.py mein aisa hona chahiye:
path('api/save-seating-plan/', views.save_seating_plan, name='save_seating_plan'),
]