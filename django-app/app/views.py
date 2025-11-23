"""
Definition of views.
"""

from datetime import datetime
from typing import Any
from .models import *
from django.shortcuts import redirect, render
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from .forms import RegisterForm, LoginForm

def role_required(role):
    def decorator(view_func):
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login')
            if hasattr(request.user, 'role') and request.user.role.casefold() == role.casefold():
                return view_func(request, *args, **kwargs)
            return HttpResponse('Unauthorized', status=401)
        return _wrapped_view
    return decorator


@login_required
def view_favorites(request: HttpRequest) -> Any:
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/favourites.html',
        {
            'game_years': Games.objects.values_list('releaseYear', flat=True).distinct().order_by('releaseYear').reverse(), 
            'game_genres': Games.objects.values_list('genre', flat=True).distinct().order_by('genre'), 
        }
    )

@role_required('admin')
def edit_Game(request: HttpRequest, gameID: int) -> Any:
    assert isinstance(request, HttpRequest)
    game = Games.objects.get(gameID=gameID)
    if request.method == "POST":
        game.title = request.POST.get('title', game.title)
        game.studio = request.POST.get('studio', game.studio)
        game.releaseYear = request.POST.get('releaseYear', game.releaseYear)
        game.rating = request.POST.get('rating', game.rating)
        game.genre = request.POST.get('genre', game.genre)
        game.save()
        return redirect('game_detail', gameID=game.gameID)
    # Logic for editing a game goes here
    return render(
        request,
        'app/edit_game.html',
        {
            'game': game,
        }
    )

@role_required('admin')
def edit_Song(request: HttpRequest, songID: int) -> Any:
    assert isinstance(request, HttpRequest)
    # Logic for editing a song goes here
    song = Songs.objects.get(songID=songID)
    return render(
        request,
        'app/edit_song.html',
        {
            'song': song,
        }
    )


@login_required
def view_favorites(request: HttpRequest) -> Any:
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/favourites.html',
        {
            'game_years': Games.objects.values_list('releaseYear', flat=True).distinct().order_by('releaseYear').reverse(), 
            'game_genres': Games.objects.values_list('genre', flat=True).distinct().order_by('genre'), 
        }
    )

def home(request):
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
def loginView(request):
    """Renders the login page."""
    assert isinstance(request, HttpRequest)
    if request.user.is_authenticated:
        return redirect('home')
    if request.method == "POST":
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            login(request, user)
            return redirect('home')

        else:
            return render(
                request,
                'app/login.html',
                {
                    'title':'Log in',
                    'year':datetime.now().year,
                    'form': form,
                }
            )
    return render(
        request,
        'app/login.html',
        {
            'title':'Log in',
            'year':datetime.now().year,
            'form': LoginForm(),
        }
    )



@login_required
def get_favs_per_game(request: HttpRequest, gameId: int) -> Any:
    assert isinstance(request, HttpRequest)
    songs = Songs.objects.filter(gameID=gameId)

    favs_per_user_id = FavSongs.objects.filter(songID__in=songs.values('songID'), userID=request.user)

    return JsonResponse({'favs_per_user_id': [song for song in favs_per_user_id.values_list('songID__songID', flat=True)]}) 


@login_required
def get_fav_songs(request: HttpRequest) -> Any:
    assert isinstance(request, HttpRequest)

    songs = Songs.objects.filter(songID__in=FavSongs.objects.filter(userID=request.user).values_list('songID', flat=True))

    return JsonResponse(list(songs.values()), safe=False)



def register(request):
    """Renders the register page."""
    assert isinstance(request, HttpRequest)
    if request.user.is_authenticated:
        return redirect('home')
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.usename = form.cleaned_data['username']
            user.email = form.cleaned_data['email']
            user.set_password(form.cleaned_data['password1'])
            user.save()
            if user.userID == 1:
                user.role = 'admin'
                user.save()
            login(request, user)


            # Redirect to a success page.
            return redirect('home')
        else:
            return redirect('register')
    if request.method == "GET":
        form=RegisterForm()
        return render(
            request,
            'app/register.html',
            {
                'title':'Register',
                'year':datetime.now().year,
                'form': form,
            }
        )
    

def game_detail(request: HttpRequest, gameID: int) -> Any:
    assert isinstance(request, HttpRequest)
    game = Games.objects.get(gameID=gameID)
    songs = Songs.objects.filter(gameID=gameID)
    return render(
        request,
        'app/game_detail.html',
        {
            'game': game,
            'songs': songs,
            
        }
    )


@login_required
def add_to_favs(request: HttpRequest, songId: int) -> Any:
    assert isinstance(request, HttpRequest)
    if request.user.is_authenticated:
        favorite_songs = FavSongs.objects.filter(userID=request.user, songID=songId)
        if not favorite_songs.exists():
            fav_song = FavSongs(userID=request.user, songID=Songs.objects.get(songID=songId))
            fav_song.save()
            return HttpResponse(status=200)  # OK
        else:
            favorite_songs.delete()
            return HttpResponse(status=200)  # OK
        
    return HttpResponse(status=401)  # Unauthorized if user is not authenticated

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

def search_games(request: HttpRequest) -> Any:
    assert isinstance(request, HttpRequest)
    searchresult = request.GET.get('searchResult', '')
    genre = request.GET.get('genre', '')
    year = request.GET.get('year', 0)
    games = Games.objects.all()
    if genre != "":
        games = games.filter(genre=genre)
    if year != 0:
        games = games.filter(releaseYear=year)
    if searchresult != "":
        games = games.filter(title__icontains=searchresult)
    return render(
        request,
        'app/gamesGrid.html',
        {
            'games': games.order_by('releaseYear').reverse(),
        }
    )

