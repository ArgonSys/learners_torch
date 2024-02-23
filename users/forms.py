from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django import forms
from django.utils.translation import gettext as _
from betterforms.multiform import MultiModelForm


from .models import User
from profiles.forms import ProfileForm


class UserForm(UserCreationForm):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

        self.fields["username"].widget.attrs.update(
            {
                "placeholder": _("User name"),
            }
        )

        self.fields["email"].widget.attrs.update(
            {
                "placeholder": _("Email address"),
            }
        )

        self.fields["password1"].widget.attrs.update(
            {
                "placeholder": _("Password"),
            }
        )

        self.fields["password2"].widget.attrs.update(
            {
                "placeholder": _("Password confirmation"),
            }
        )

    class Meta:
        model = User
        fields = (
            "username",
            "email",
        )


class SignupForm(MultiModelForm):
    form_classes = {
        "user": UserForm,
        "profile": ProfileForm,
    }


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
