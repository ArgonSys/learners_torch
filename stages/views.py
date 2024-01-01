from django.shortcuts import render, redirect, get_object_or_404
from django.views import View

from .models import Stage
from .forms import StageForm

from plans.models import Plan


class StageCreateView(View):
    def get(self, request, plan_pk):
        get_object_or_404(Plan, pk=plan_pk)
        form = StageForm
        context = {"form": form, "plan_pk": plan_pk}
        return render(request, "stages/new.html", context)

    def post(self, request, plan_pk):
        form = StageForm(request.POST)
        if form.is_valid:
            stage = form.save(commit=False)
            stage.plan = get_object_or_404(Plan, pk=plan_pk)
            stage.order = Stage.objects.count() + 1
            stage.save()
            return redirect("plans:show", plan_pk=plan_pk)
        context = {"form": form}
        return render(request, "stages/new.html", context)



class StageUpdateView(View):
    def get(self, request, stage_pk):
        stage = get_object_or_404(Stage, pk=stage_pk)
        form = StageForm(instance=stage)
        context = {"form": form, "stage_pk": stage_pk}
        return render(request, "stages/edit.html", context)
