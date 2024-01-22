from django import forms

from .models import TimeLog


class HourMinuteSecondForm(forms.Form):
    hour = forms.IntegerField()
    minute = forms.IntegerField()
    second = forms.IntegerField()

    def clean(self):
        data = self.cleaned_data
        data["time"] = data["hour"] * 3600 + data["minute"] * 60 + data["second"]
        return data


class TimeForm(forms.ModelForm):
    class Meta:
        model = TimeLog
        fields = ("planed_time",)
