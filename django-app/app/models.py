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



# Create your models here.
