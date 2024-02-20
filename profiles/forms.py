from django import forms
from django.utils.translation import gettext as _

from .models import Profile


class ProfileForm(forms.ModelForm):

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

        self.fields["icon"].widget.attrs.update(
            {
                "class": "hidden",
            }
        )

        self.fields["bio"].widget.attrs.update(
            {
                "placeholder": _("Bio"),
            }
        )

        self.fields["affiliation"].widget.attrs.update(
            {
                "placeholder": _("Affiliation"),
            }
        )

        self.fields["location"].widget.attrs.update(
            {
                "placeholder": _("Location"),
            }
        )

    class Meta:
        model = Profile
        fields = (
            "icon",
            "bio",
            "affiliation",
            "location",
        )
