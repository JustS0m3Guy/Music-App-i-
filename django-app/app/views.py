"""
Definition of views.
"""

from datetime import datetime
from typing import Any
from .models import Games, Songs, Comments, User
from django.shortcuts import render
from django.http import HttpRequest, JsonResponse
from django.contrib.auth import login, authenticate
from .forms import RegisterForm, LoginForm#, CommentForm

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
def loginView(request):
    """Renders the login page."""
    assert isinstance(request, HttpRequest)
    if request.method == "POST":
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            login(request, user)
            return render(
                request,
                'app/index.html',
                {
                    'title':'Login Successful',
                    'year':datetime.now().year,
                }
            )
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

def register(request):
    """Renders the register page."""
    assert isinstance(request, HttpRequest)
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.usename = form.cleaned_data['username']
            user.email = form.cleaned_data['email']
            user.set_password(form.cleaned_data['password1'])
            user.save()
            login(request, user)


            # Redirect to a success page.
            return render(
                request,
                'app/register_success.html',
                {
                    'title':'Registration Successful',
                    'year':datetime.now().year,
                }
            )
        else:
            return render(
                request,
                'app/register.html',
                {
                    'title':'Register',
                    'year':datetime.now().year,
                    'form': form,
                }
            )
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

# create a path in urls.py                                  done
# make a function for it with a post request                done
# fetch data from json from the request                     done
# if it's a get then return all comments                    done
# modify the game_detail.js to fetch comments               done
# create a new comment object and save it to the database   
# support both get and post requests                        
# after packiging into a json send it to the api            

#@login_required
def get_comments(request, gameID: int):
    """Renders the comment page."""
    assert isinstance(request, HttpRequest)
    if request.method == "POST":
        comment = request.POST.get('commentText', '')

    if request.method == "GET":
        comments = Comments.objects.all().filter(gameID=gameID)
        
        return render(
            request,
            'app/commentsGrid.html',
            {
                'comments': comments
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
