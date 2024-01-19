from django import forms

from .models import TimeLog


class TimeForm(forms.ModelForm):
    class Meta:
        model = TimeLog
        fields = ("planed_time",)
