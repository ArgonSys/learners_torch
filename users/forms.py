from django.contrib.auth.forms import UserCreationForm, AuthenticationForm

from .models import User


class SignupForm(UserCreationForm):
    class Meta:
        model = User
        fields = (
            "username",
            "email",
        )


class LoginForm(AuthenticationForm):
    class Meta:
        model = User
