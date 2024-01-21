from django import forms

from .models import Task

from time_logs.forms import TimeForm


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = (
            "name",
            "description",
        )
