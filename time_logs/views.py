import math

from django.shortcuts import render
from django.views import View

from tasks.models import Task
from stages.models import Stage
from .models import TimeLog


class MeasureTimeView(View):
    def get(self, request):
        task = Task.objects.get(pk=57)
        stage = Stage.objects.get(pk=35)
        planed_time = int(
            TimeLog.objects.get(task=task, stage=stage).planed_time.total_seconds()
            * 1000
        )

        remain_time = planed_time

        context = {"planed_time": planed_time, "remain_time": remain_time}
        return render(request, "time_logs/measure_time.html", context)

    def post(self, request):
        return render(request, "time_logs/measure_time.html")
