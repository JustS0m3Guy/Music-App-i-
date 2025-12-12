"""
Definition of urls for django_app.
"""

from datetime import datetime
from django.urls import path
from django.contrib import admin
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path, include
from django.conf.urls.i18n import i18n_patterns
from app import forms, views


urlpatterns = i18n_patterns(
    path('', views.home, name='home'),
    path('favourites/', views.view_favorites, name='favourites'),
    path('edit-song/<int:songID>/', views.edit_Song, name='edit_song'),
    path('games/<int:gameID>/edit/', views.edit_Game, name='edit_game'),
    path('register/', views.register, name='register'),
    path('games/<int:gameID>/', views.game_detail, name='game_detail'),
    path('games/<int:gameID>/api/get-comments/', views.get_comments, name='get_comments'),
    path('accounts/login/', views.loginView, name='login'),
    path('logout/', LogoutView.as_view(next_page='/'), name='logout'),
    path('admin/', admin.site.urls),
    path('api/get-games/', views.get_games, name='get_games'),
    path('api/add-to-favs/<int:songId>/', views.add_to_favs, name='add_to_favs'),
    path('api/get-favs-per-game/<int:gameId>/', views.get_favs_per_game, name='get_favs_per_game'),
    path('api/get-fav-songs/', views.get_fav_songs, name='get_fav_songs'),
    path('api/search-games/', views.search_games, name='search_games'),
    prefix_default_language=False,
) + [
    path('set-language/', views.set_language_preference, name='set_language_preference'),
    path('i18n/', include('django.conf.urls.i18n')),
]
