import datetime

from django.db import models
from django.utils.translation import gettext_lazy as _


class TimeLog(models.Model):
    stage = models.ForeignKey(
        "stages.Stage", verbose_name=_("stage"), on_delete=models.CASCADE
    )
    task = models.ForeignKey(
        "tasks.Task", verbose_name=_("task"), on_delete=models.CASCADE
    )
    planed_time = models.DurationField(_("planed time"))
    date_created = models.DateTimeField(_("created time"), auto_now_add=True)
    date_updated = models.DateTimeField(_("updated time"), auto_now=True)

    class Meta:
        db_table = "time_logs"
        verbose_name = _("time_log")
        verbose_name_plural = _("time_logs")

    @property
    def passed_time(self):
        passed_time = datetime.timedelta()
        actual_times = self.actualtime_set.all()
        if actual_times:
            passed_time = actual_times.aggregate(passed_time=models.Sum("measured_time"))["passed_time"]
        return passed_time

    @property
    def remain_time(self):
        return self.planed_time - self.passed_time


class ActualTime(models.Model):
    time_log = models.ForeignKey(
        "TimeLog", verbose_name=_("time log"), on_delete=models.CASCADE
    )
    date_started = models.DateTimeField(
        _("started time"), auto_now=False, auto_now_add=False
    )
    measured_time = models.DurationField(_("actual time"))

    class Meta:
        db_table = "actual_times"
        verbose_name = _("actual_time")
        verbose_name_plural = _("actual_times")
