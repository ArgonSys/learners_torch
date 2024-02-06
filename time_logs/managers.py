from datetime import timedelta

from django.db import models
from django.db.models import Sum, F, FloatField
from django.db.models.functions import Coalesce


class TimeLogManager(models.Manager):
    def progress(self):
        time_logs = self.get_queryset()
        progress = time_logs.annotate(passed_time=Coalesce(Sum("actualtime__measured_time"), timedelta()))\
            .annotate(remain_time=Coalesce(F("planed_time") - F("passed_time"), timedelta()))\
            .annotate(passed_ratio=Coalesce(F("passed_time") / F("planed_time") * 100, 0, output_field=FloatField()))
        return progress
