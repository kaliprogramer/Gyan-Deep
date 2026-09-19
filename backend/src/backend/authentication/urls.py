from django.urls import path

from .views import (
    LoginView,
    RegisterView,
    LogoutView,
    MeView,
    StudentListView,
    TeacherListView,
    
)
from .views import RefreshView as TokenRefreshView

urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),

    path(
        "me/",
        MeView.as_view(),
        name="me",
    ),
    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path(
        "users/students/",
        StudentListView.as_view(),
        name="student_list",
    ),
    path(
        "users/teachers/",
        TeacherListView.as_view(),
        name="teacher_list",
    ),
]