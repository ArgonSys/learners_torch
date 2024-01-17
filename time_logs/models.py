from django.db import models

from django.utils.translation import gettext_lazy as _


class TimeLog(models.Model):
    stage = models.ForeignKey(
        "stages.Stage", verbose_name=_("stage"), on_delete=models.CASCADE
    )
    task = models.ForeignKey(
        "tasks.Task", verbose_name=_("task"), on_delete=models.CASCADE
    )
    planed_time = models.DateTimeField(
        _("planed time"), auto_now=False, auto_now_add=False
    )
    date_created = models.DateTimeField(_("created time"), auto_now_add=True)
    date_updated = models.DateTimeField(_("updated time"), auto_now=True)

    class Meta:
        db_table = "time_logs"
        verbose_name = _("time_log")
        verbose_name_plural = _("time_logs")


class ActualTime(models.Model):
    time_log = models.ForeignKey(
        "TimeLog", verbose_name=_("time log"), on_delete=models.CASCADE
    )
    date_started = models.DateTimeField(
        _("started time"), auto_now=False, auto_now_add=False
    )
    actual_time = models.DurationField(_("actual time"))
    date_measured = models.DateTimeField(_("measured time"), auto_now_add=False)

    class Meta:
        db_table = "actual_times"
        verbose_name = _("actual_time")
        verbose_name_plural = _("actual_times")
