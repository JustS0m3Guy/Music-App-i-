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
    path('contact/', views.contact, name='contact'),
    path('about/', views.about, name='about'),
    path('games/<int:gameID>/', views.game_detail, name='game_detail'),
    path('login/',
         LoginView.as_view
         (
             template_name='app/login.html',
             #authentication_form=forms.BootstrapAuthenticationForm,
             extra_context=
             {
                 'title': 'Log in',
                 'year' : datetime.now().year,
             }
         ),
         name='login'),
    path('logout/', LogoutView.as_view(next_page='/'), name='logout'),
    path('admin/', admin.site.urls),
]
