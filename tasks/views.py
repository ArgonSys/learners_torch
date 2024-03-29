import json
import datetime
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseForbidden
from django.views import View
from django.db import transaction

from .models import Task
from .forms import TaskForm

from plans.models import Plan
from stages.models import Stage
from time_logs.models import TimeLog, ActualTime


class TaskShowView(View):
    def get(self, request, task_pk):
        task = Task.objects.get(pk=task_pk)
        stage = task.stage

        planed_time = 0

        actual_times = ActualTime.objects.prefetch_related("time_log__stage")\
            .filter(time_log__task=task).order_by("-date_started")

        progresses = TimeLog.objects.progress().prefetch_related("stage")\
            .filter(task=task).order_by("stage__order")

        progress = progresses.filter(task=task, stage=stage).first()
        if progress:
            planed_time = int(progress.planed_time.total_seconds() * 1000)

        context = {
            "task": task,
            "stage": stage,
            "planed_time": planed_time,
            "progresses": progresses,
            "actual_times": actual_times,
        }
        return render(request, "tasks/show.html", context)


class TaskCreateView(View):
    def get(self, request, plan_pk):
        plan = get_object_or_404(Plan, pk=plan_pk)
        stages = plan.stage_set.filter(order__gt=0).order_by("order")
        task_form = TaskForm()
        context = {
            "task_form": task_form,
            "stages": stages,
        }
        return render(request, "tasks/new.html", context)

    @transaction.atomic
    def post(self, request, plan_pk):
        plan = get_object_or_404(Plan, pk=plan_pk)
        stages = plan.stage_set.filter(order__gt=0).order_by("order")
        pending_stage = plan.stage_set.get(order=-2)
        params = request.POST.copy()

        # 時間、分、秒のリストから秒数のリストに変換
        if "planed_times" not in params:
            times = convert_times(
                params.getlist("hours[]"),
                params.getlist("minutes[]"),
                params.getlist("seconds[]"),
            )
            params["times"] = times

        task_form = TaskForm(params)
        if task_form.is_valid():
            task = task_form.save(commit=False)
            task.stage = pending_stage
            task.order = pending_stage.task_set.filter(order__gt=0).count() + 1
            task.save()

            times = params["times"]
            for i in range(len(times)):
                # 時間が設定されていないものを保存しないように
                if times[i] == 0:
                    continue

                time_log = TimeLog()
                time_log.planed_time = datetime.timedelta(seconds=times[i])
                time_log.task = task
                time_log.stage = get_object_or_404(
                    Stage, pk=params.getlist("stage-ids[]")[i]
                )
                time_log.save()
            return redirect("plans:show", plan_pk=plan_pk)

        context = {
            "task_form": task_form,
            "stages": stages,
        }
        return render(request, "tasks/new.html", context)


class TaskUpdateView(View):
    def get(self, request, task_pk):
        task = get_object_or_404(Task, pk=task_pk)
        plan = task.stage.plan
        stages = plan.stage_set.filter(order__gt=0).order_by("order")
        task_form = TaskForm(instance=task)
        context = {
            "task_form": task_form,
            "stages": stages,
            "task_pk": task_pk,
        }
        return render(request, "tasks/edit.html", context)

    def post(self, request, task_pk):
        task = get_object_or_404(Task, pk=task_pk)
        plan = task.stage.plan
        stages = plan.stage_set.filter(order__gt=0).order_by("order")

        params = request.POST.copy()
        # 時間、分、秒のリストから秒数のリストに変換
        if "planed_times" not in params:
            times = convert_times(
                params.getlist("hours[]"),
                params.getlist("minutes[]"),
                params.getlist("seconds[]"),
            )
            params["times"] = times

        task_form = TaskForm(params, instance=task)
        if task_form.is_valid():
            task = task_form.save(commit=False)
            task.save()

            times = params["times"]
            for i in range(len(times)):
                # 時間が設定されていないものを保存しないように
                if times[i] == 0:
                    continue

                stage = get_object_or_404(Stage, pk=params.getlist("stage-ids[]")[i])
                time_log = (
                    TimeLog.objects.filter(task=task, stage=stage).first() or TimeLog()
                )
                time_log.planed_time = datetime.timedelta(seconds=times[i])
                time_log.task = task
                time_log.stage = stage
                time_log.save()
            return redirect("plans:show", plan_pk=plan.pk)

        context = {
            "task_form": task_form,
            "stages": stages,
        }
        return render(request, "tasks/new.html", context)


class TaskDeleteView(View):
    def post(self, request, task_pk):
        task = get_object_or_404(Task, pk=task_pk)
        stage = task.stage
        plan = stage.plan
        if request.user != plan.owner:
            return HttpResponseForbidden("このステージを削除することは禁止されています。")

        # task orderの修正
        tasks = stage.task_set.filter(order__gt=task.order)
        for ts in tasks:
            ts.order -= 1
            ts.save()

        task.delete()
        return redirect("plans:show", plan_pk=plan.pk)


class TaskSwapView(View):
    @transaction.atomic
    def post(self, request):
        data = json.loads(request.body)
        destination_stage = get_object_or_404(Stage, pk=data["stage-id"])
        source = get_object_or_404(Task, pk=data["source-id"])
        destination_order = int(data["destination-order"])

        if destination_stage == source.stage:
            # 移動先が移動元より小さい order を持つとき、負の方向にスライド
            if source.order < destination_order:
                slide = -1
                tasks = source.stage.task_set.filter(
                    order__range=(source.order, destination_order)
                )

            # 移動先が移動元より大きい order を持つとき、正の方向にスライド
            elif source.order > destination_order:
                slide = 1
                tasks = source.stage.task_set.filter(
                    order__range=(destination_order, source.order)
                )
            data = dict()
            for task in tasks:
                if task == source:
                    task.order = destination_order
                else:
                    task.order += slide
                task.save()
                print(task, task.order)
                if task.stage.pk not in data:
                    data[task.stage.pk] = dict()
                data[task.stage.pk] |= {task.pk: task.order}
            print(data)

        else:
            print(f"destination_order:{destination_order}")
            # source.stage の source.order より大きい order を -1
            # destination_stage の destination_order より大きい order を +1
            source_tasks = source.stage.task_set.filter(order__gte=source.order)
            destination_tasks = destination_stage.task_set.filter(
                order__gte=destination_order
            )
            print(f"source_tasks:{source_tasks}")
            print(f"destination_tasks:{destination_tasks}")

            data = dict()
            for task in destination_tasks:
                task.order += 1
                print(f"{task.name} {task.pk} {task.stage.pk} {task.order}")
                task.save()

                if task.stage.pk not in data:
                    data[task.stage.pk] = dict()
                data[task.stage.pk] |= {task.pk: task.order}

            for task in source_tasks:
                if task == source:
                    task.stage = destination_stage
                    task.order = destination_order
                else:
                    task.order -= 1
                print(f"{task.name} {task.pk} {task.stage.pk} {task.order}")
                task.save()

                if task.stage.pk not in data:
                    data[task.stage.pk] = dict()
                data[task.stage.pk] |= {task.pk: task.order}
            print(data)

        return JsonResponse(data)


def convert_times(hours, minutes, seconds):
    """hours, minutes, secondsをtimes配列に変換(単位は秒)

    Args:
        hours (list): 時間
        minutes (list): 分
        seconds (list): 秒

    Returns:
        list: 秒に直した配列
    """
    times = []
    for i in range(len(hours)):
        time = int(hours[i]) * 3600 + int(minutes[i]) * 60 + int(seconds[i])
        times.append(time)

    return times
