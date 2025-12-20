"""
Definition of models.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('guest', 'Guest'),
    ]
    userID = models.BigAutoField(unique=True, primary_key=True)
    username = models.CharField(max_length=128, unique=True, null=False, default='')
    email = models.EmailField(max_length=128, unique=True, null=False, default='')
    date_joined = models.DateTimeField(auto_now_add=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='guest')
    last_login = None
    first_name = None
    last_name = None

class Games(models.Model):
    gameID = models.BigAutoField(unique=True, primary_key=True)
    title = models.CharField('Title', max_length=256, unique=True, null=False, default='No Name')
    studio = models.CharField('Studio', max_length=256, null=True, blank=True)
    releaseYear = models.SmallIntegerField('Release Year', null=True, blank=True)
    rating = models.FloatField('Rating', null=True, blank=True)
    genre = models.CharField('Genre', max_length=128, null=True, blank=True)
    imageURL = models.URLField('Image URL', max_length=512, null=True, blank=True, default='')

class Songs(models.Model):
    songID = models.BigAutoField(unique=True, primary_key=True)
    songName = models.CharField('Song Name', max_length=128, null=True, blank=True)
    gameID = models.ForeignKey(Games, on_delete=models.SET_NULL, null=True, blank=True, default=None)
    videoURL = models.URLField('Video URL', max_length=512, null=True, blank=True, default='')
    length = models.DurationField('Length', null=True, blank=True)

class FavSongs(models.Model):
    userID = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, default=None)
    songID = models.ForeignKey(Songs, on_delete=models.SET_NULL, null=True, blank=True, default=None)

class BadgeTypes(models.Model):
    badgeTypeID = models.BigAutoField(unique=True, primary_key=True)
    badgeName = models.CharField('Badge Name', max_length=128, null=False, default='No Name')
    badgeDesc = models.TextField('Badge Description', null=True, blank=True)

class UserBadges(models.Model):
    userID = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, default=None)
    badgeTypeID = models.ForeignKey(BadgeTypes, on_delete=models.SET_NULL, null=True, blank=True, default=None)

class Comments(models.Model):
    commentID = models.BigAutoField(unique=True, primary_key=True)
    userID = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, default=None)
    gameID = models.ForeignKey(Games, on_delete=models.SET_NULL, null=True, blank=True, default=None)
    commentText = models.TextField('Comment', max_length=512, null=False, default='')
    commentTime = models.DateTimeField('Comment Time', default=now, null=False)


# Create your models here.