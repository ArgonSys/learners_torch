from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _

from .models import Stage

from plans.models import Plan


def initialize_stages(plan_pk, stages=None):
    """Create stages with generating plan

    Args:
        plan_pk (integer): Plan's pk
        stages (list): Each element's dict require name, description and order key.
                       Default to None, Pending and Done stages.
    """
    plan = get_object_or_404(Plan, pk=plan_pk)
    if stages is None:
        stages = [
            {
                "name": _("Pending"),
                "description": _("Pending or just created tasks"),
                "order": "-2",
            },
            {
                "name": _("Done"),
                "description": _("Done tasks"),
                "order": "-1",
            },
        ]
    for stage_dict in stages:
        try:
            name = stage_dict["name"]
            description = stage_dict["description"]
            order = stage_dict["order"]
        except KeyError as e:
            print(e)
        else:
            stage = Stage(name=name, description=description, order=order, plan=plan)
            if stage.full_clean:
                stage.save()
