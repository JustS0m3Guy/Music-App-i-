"""
Definition of models.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    userID = models.BigAutoField(unique=True, primary_key=True)
    username = models.CharField(max_length=128, unique=True, null=False, default='')
    #password = models.BinaryField(max_length=32, blank=False, default=0)
    email = models.EmailField(max_length=128, unique=True, null=False, default='')

    last_login = None
    first_name = None
    last_name = None
    #AbstractUser.Meta.abstract = True 

class Games(models.Model):
    gameID = models.BigAutoField(unique=True, primary_key=True, )
    title = models.CharField(max_length=256, unique=True, null=False, default='No Name')
    studio = models.CharField(max_length=256, null=True, blank=True)
    releaseYear = models.SmallIntegerField(null=True, blank=True)
    rating = models.FloatField(null=True, blank=True)
    genre = models.CharField(max_length=128, null=True, blank=True)

class Songs(models.Model):
    songID = models.BigAutoField(unique=True, primary_key=True)
    songName = models.CharField(max_length=128, null=True, blank=True)
    gameID = models.ForeignKey(Games, on_delete=models.SET_DEFAULT, default=None)
    videoURL = models.URLField(max_length=512, null=True, blank=True, default='')
    length = models.DurationField(null=True, blank=True)

class FavSongs(models.Model):
    userID = models.ForeignKey(User, on_delete=models.SET_DEFAULT, default=None) #foreign
    songID = models.ForeignKey(Songs, on_delete=models.SET_DEFAULT, default=None) #foreign


# Create your models here.
