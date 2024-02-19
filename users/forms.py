from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django import forms
from django.utils.translation import gettext as _

from .models import User


class SignupForm(UserCreationForm):
    class Meta:
        model = User
        fields = (
            "username",
            "email",
        )


class LoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["username"].widget = forms.EmailInput(
            attrs={
                "autofocus": True,
                "placeholder": _("Email address"),
            }
        )

        self.fields["password"].widget.attrs.update(
            {
                "placeholder": _("Password"),
            }
        )
