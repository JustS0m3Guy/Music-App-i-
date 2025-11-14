"""
Definition of urls for django_app.
"""

from datetime import datetime
from django.urls import path
from django.contrib import admin
from django.contrib.auth.views import LoginView, LogoutView
from app import forms, views


urlpatterns = [
    path('', views.home, name='home'),
    path('api/get-games/', views.get_games, name='get_games'),
    path('about/', views.about, name='about'),
    path('register/', views.register, name='register'),
    path('games/<int:gameID>/', views.game_detail, name='game_detail'),
    path('login/', views.loginView, name='login'),
    path('logout/', LogoutView.as_view(next_page='/'), name='logout'),
    path('admin/', admin.site.urls),
]
