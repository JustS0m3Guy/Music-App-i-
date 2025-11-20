"""
Definition of models.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now


class UserRoles(models.Model):
    roleID = models.BigAutoField(unique=True, primary_key=True)
    roleName = models.CharField(max_length=128, null=False, default='No Name')

class User(AbstractUser):
    userID = models.BigAutoField(unique=True, primary_key=True)
    username = models.CharField(max_length=128, unique=True, null=False, default='')
    email = models.EmailField(max_length=128, unique=True, null=False, default='')
    date_joined = models.DateTimeField(auto_now_add=True)
    role = models.ForeignKey(UserRoles, on_delete=models.SET_NULL, null=True, blank=True, default=None)
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
    gameID = models.ForeignKey(Games, on_delete=models.SET_NULL, null=True, blank=True, default=None)
    videoURL = models.URLField(max_length=512, null=True, blank=True, default='')
    length = models.DurationField(null=True, blank=True)

class FavSongs(models.Model):
    userID = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, default=None) #foreign
    songID = models.ForeignKey(Songs, on_delete=models.SET_NULL, null=True, blank=True, default=None) #foreign

class BadgeTypes(models.Model):
    badgeTypeID = models.BigAutoField(unique=True, primary_key=True)
    badgeName = models.CharField(max_length=128, null=False, default='No Name')
    badgeDesc = models.TextField(null=True, blank=True)

class UserBadges(models.Model):
    userID = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, default=None) #foreign
    badgeTypeID = models.ForeignKey(BadgeTypes, on_delete=models.SET_NULL, null=True, blank=True, default=None) #foreign

class Comments(models.Model):
    commentID = models.BigAutoField(unique=True, primary_key=True)
    userID = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, default=None) #foreign
    songID = models.ForeignKey(Songs, on_delete=models.SET_NULL, null=True, blank=True, default=None) #foreign
    commentText = models.TextField(max_length=512 ,null=False, default='')
    timestamp = models.DateTimeField(auto_now_add=True)


# Create your models here.
