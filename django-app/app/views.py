"""
Definition of views.
"""

from datetime import datetime
from typing import Any
from .models import Games
from django.shortcuts import render
from django.http import HttpRequest

def home(request):
    games= Games.objects.all()

    """Renders the home page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/index.html',
        {
            'title':'Home Page',
            'year':datetime.now().year,
            # 'games': games.order_by('releaseYear').reverse(),
            'game_years': Games.objects.values_list('releaseYear', flat=True).distinct().order_by('releaseYear').reverse(), 
            'game_genres': Games.objects.values_list('genre', flat=True).distinct().order_by('genre'), 

        }
    )

def game_detail(request: HttpRequest, gameID: int) -> Any:
    assert isinstance(request, HttpRequest)
    game = Games.objects.get(gameID=gameID)
    return render(
        request,
        'app/game_detail.html',
        {
            'game': game,
        }
    )

def get_games(request: HttpRequest) -> Any:
    assert isinstance(request, HttpRequest)
    genre = request.GET.get('genre', '')
    year = request.GET.get('year', 0)
    games = Games.objects.all()
    if genre != "":
        games = games.filter(genre=genre)
    if year != 0:
        games = games.filter(releaseYear=year)
    return render(
        request,
        'app/gamesGrid.html',
        {
            'games': games.order_by('releaseYear').reverse(),
        }
    )
def contact(request):
    """Renders the contact page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/contact.html',
        {
            'title':'Contact',
            'message':'Your contact page.',
            'year':datetime.now().year,
        }
    )

def about(request):
    """Renders the about page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/about.html',
        {
            'title':'About',
            'message':'Your application description page.',
            'year':datetime.now().year,
        }
    )
