from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseForbidden

from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin

from .models import Plan
from .forms import PlanForm

from stages.utils import initialize_stages


class PlansShowView(LoginRequiredMixin, View):
    def get(self, request, plan_pk):
        plan = get_object_or_404(Plan, pk=plan_pk)
        if request.user != plan.owner and request.user not in plan.permittees.all():
            return HttpResponseForbidden("このプランを閲覧することは禁止されています。")
        stages = plan.stage_set.filter(order__gt=0).order_by("order")
        pending = plan.stage_set.get(order=-2)
        done = plan.stage_set.get(order=-1)
        current_task = request.user.current_task
        context = {"plan": plan, "stages": stages, "pending": pending, "done": done, "current_task": current_task}
        return render(request, "plans/show.html", context)


class PlansIndexView(LoginRequiredMixin, View):
    def get(self, request):
        plans = request.user.plan_set.prefetch_related("owner")
        current_task = request.user.current_task
        context = {"plans": plans, "current_task": current_task}
        return render(request, "plans/index.html", context)


class PlansCreateView(LoginRequiredMixin, View):
    def get(self, request):
        form = PlanForm()
        current_task = request.user.current_task
        context = {"form": form, "current_task": current_task}
        return render(request, "plans/new.html", context)

    def post(self, request):
        form = PlanForm(request.POST)
        current_task = request.user.current_task
        if form.is_valid:
            plan = form.save(commit=False)
            plan.owner = request.user
            plan.save()
            initialize_stages(plan.pk)
            return redirect("plans:show", plan_pk=plan.pk)
        context = {"form": form, "current_task": current_task}
        return render(request, "plans/new.html", context)


class PlansUpdateView(LoginRequiredMixin, View):
    def get(self, request, plan_pk):
        plan = get_object_or_404(Plan, pk=plan_pk)
        if request.user != plan.owner and request.user not in plan.permittees.all():
            return HttpResponseForbidden("このプランを編集することは禁止されています。")

        form = PlanForm(instance=plan)
        current_task = request.user.current_task
        context = {"form": form, "current_task": current_task}
        return render(request, "plans/edit.html", context)

    def post(self, request, plan_pk):
        plan = get_object_or_404(Plan, pk=plan_pk)
        if request.user != plan.owner and request.user not in plan.permittees.all():
            return HttpResponseForbidden("このプランを更新することは禁止されています。")

        form = PlanForm(request.POST, instance=plan)
        if form.is_valid:
            plan = form.save(commit=False)
            plan.owner = request.user
            plan.save()
            return redirect("plans:show", plan_pk=plan.pk)
        current_task = request.user.current_task
        context = {"form": form, "current_task": current_task}
        return render(request, "plans/edit.html", context)


class PlansDeleteView(LoginRequiredMixin, View):
    def post(self, request, plan_pk):
        plan = get_object_or_404(Plan, pk=plan_pk)
        if request.user != plan.owner:
            return HttpResponseForbidden("このプランを削除することは禁止されています。")
        plan.delete()
        return redirect("top")
