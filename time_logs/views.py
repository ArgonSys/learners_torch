import math

from django.shortcuts import render
from django.views import View

from tasks.models import Task
from .models import TimeLog


class MeasureTimeView(View):
    def get(self, request, task_pk):
        task = Task.objects.get(pk=task_pk)
        stage = task.stage
        time_log = TimeLog.objects.filter(task=task, stage=stage).first()
        planed_time = (
            int(time_log.planed_time.total_seconds() * 1000) if time_log else 0
        )

        remain_time = planed_time

        context = {"planed_time": planed_time, "remain_time": remain_time}
        return render(request, "time_logs/measure_time.html", context)

    def post(self, request):
        return render(request, "time_logs/measure_time.html")
