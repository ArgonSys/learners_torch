import datetime
import json

from django.shortcuts import get_object_or_404
from django.http import HttpResponseNotFound, HttpResponseForbidden, JsonResponse
from django.views import View

from tasks.models import Task
from .models import TimeLog, ActualTime


class MeasureTimeView(View):
    def get(self, request, task_pk):
        task = Task.objects.get(pk=task_pk)
        stage = task.stage

        planed_time = 0
        remain_time = 0

        progress = TimeLog.objects.progress().filter(task=task, stage=stage).first()
        if progress:
            planed_time = int(progress.planed_time.total_seconds() * 1000)
            remain_time = int(progress.remain_time.total_seconds() * 1000)

        response = {
            "planedTime": planed_time,
            "remainTime": remain_time,
        }
        return JsonResponse(response)

    def post(self, request, task_pk):
        task = Task.objects.get(pk=task_pk)
        stage = task.stage

        data = json.loads(request.body)
        time_log = TimeLog.objects.filter(task=task, stage=stage).first()
        if not time_log:
            return HttpResponseNotFound("time_logが見つかりません")

        # javascriptの基準(1970/1/1 00:00:00)を加える
        date_js_std = datetime.datetime(1970, 1, 1, tzinfo=datetime.UTC)
        date_started = date_js_std + datetime.timedelta(
            seconds=data["started_time"] / 1000
        )
        measured_time = datetime.timedelta(milliseconds=data["measured_time"])
        actual_time = ActualTime(
            time_log=time_log,
            date_started=date_started,
            measured_time=measured_time,
        )
        actual_time.save()

        progress = TimeLog.objects.progress().filter(task=task, stage=stage).first()
        if progress:
            planed_time = int(progress.planed_time.total_seconds() * 1000)
            remain_time = int(progress.remain_time.total_seconds() * 1000)

        response = {
            "planedTime": planed_time,
            "remainTime": remain_time,
        }
        return JsonResponse(response)


class DeleteTimeView(View):
    def post(self, request, task_pk):
        task = get_object_or_404(Task, pk=task_pk)
        stage = task.stage
        if request.user != stage.plan.owner:
            return HttpResponseForbidden("この記録の消去は禁止されています")

        time_log = TimeLog.objects.filter(task=task, stage=stage).first()
        if not time_log:
            return HttpResponseNotFound("time_logが見つかりません")

        actual_time = time_log.actualtime_set.latest("date_started")
        actual_time.delete()

        planed_time = int(time_log.planed_time.total_seconds() * 1000)
        remain_time = int(time_log.remain_time.total_seconds() * 1000)

        response = {
            "planedTime": planed_time,
            "remainTime": remain_time,
        }
        return JsonResponse(response)
