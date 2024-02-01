import datetime

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from time_logs.models import ActualTime
from time_logs.utils import in_date


class Task(models.Model):
    name = models.CharField(_("name"), max_length=50)
    description = models.TextField(_("description"), null=True, blank=True)
    # すべての task を pending stage に移動させてから stage は削除される
    stage = models.ForeignKey(
        "stages.Stage", verbose_name=_("stage"), on_delete=models.CASCADE
    )
    order = models.IntegerField(_("order"))
    is_done = models.BooleanField(_("is done"), default=False)
    date_created = models.DateTimeField(_("created at"), auto_now_add=True)
    date_updated = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        db_table = "tasks"

    @property
    def actual_times_by_date(self):
        actual_times_by_date = dict()
        actual_times = ActualTime.objects.none()
        for time_log in self.timelog_set.all():
            actual_times = actual_times.union(time_log.actualtime_set.all())
        actual_times = actual_times.order_by("-date_started")

        date = None
        for actual_time in actual_times:
            if date is None or not in_date(actual_time.date_started, date):
                d = actual_time.date_started.date()
                t = datetime.time()
                date = datetime.datetime.combine(d, t, timezone.get_default_timezone())

            if date not in actual_times_by_date:
                actual_times_by_date[date] = list()

            actual_times_by_date[date].append(actual_time)

        return actual_times_by_date
