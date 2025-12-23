"""
Definition of forms.
"""

from django import forms
#from app.models import Comments
from django.contrib.auth.forms import AuthenticationForm, AdminUserCreationForm, UserChangeForm, UserCreationForm
from django.utils.translation import gettext_lazy as _
from django_app.settings import LANGUAGES


from .models import User

class CustomUserCreationForm(AdminUserCreationForm):
    class Meta:
        model = User
        fields = ("username", "email")


class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = User
        fields = ("username", "email")
        

class RegisterForm(UserCreationForm):


    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        email = cleaned_data.get('email')
        password = cleaned_data.get("password1")
        confirm_password = cleaned_data.get("password2")
        if not password.isalnum():
            raise forms.ValidationError(
                self.add_error('password1', 'Password contains an invalid character! :)')
            )
        if password.islower():
            raise forms.ValidationError(
                self.add_error('password1', 'Please use at least one capitalized letter! :)')
            )
        # if password != confirm_password:
        #     raise forms.ValidationError(
        #         self.add_error('password2', 'Confirm Password does not match password')
        #     )

        return cleaned_data
class LoginForm(AuthenticationForm):
    # username = forms.CharField(max_length=254, widget=forms.TextInput(
    #     attrs={'class': 'form-control', 'placeholder': 'Username'}))
    # password = forms.CharField(label=_("Password"), widget=forms.PasswordInput(
    #     attrs={'class': 'form-control', 'placeholder':'Password'}))
    class Meta:
        model = User
        fields = ['username', 'password']


# class CommentForm(forms.ModelForm):
#     class Meta:
#         model = Comments
#         fields = ['userID', 'gameID', 'commentText']
    

class BootstrapAuthenticationForm(AuthenticationForm):
   """Authentication form which uses boostrap CSS."""
   username = forms.CharField(max_length=254,
                              widget=forms.TextInput({
                                  'class': 'form-control',
                                  'placeholder': 'User name'}))
   password = forms.CharField(label=_("Password"),
                              widget=forms.PasswordInput({
                                  'class': 'form-control',
                                  'placeholder':'Password'}))

class LanguageForm(forms.Form):
    language = forms.ChoiceField(choices=LANGUAGES, 
    widget=forms.RadioSelect
    )