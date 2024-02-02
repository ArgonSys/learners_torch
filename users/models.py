from django.db import models
from django.apps import apps

from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    UserManager as BaseUserManager,
)
from django.contrib.auth.hashers import make_password

from django.contrib.auth.validators import UnicodeUsernameValidator
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from time_logs.models import ActualTime


class UserManager(BaseUserManager):
    def _create_user(self, username, email, password, **extra_fields):
        """
        Create and save a user with the given username, email, and password.
        """

        email = self.normalize_email(email)
        if not email:
            raise ValueError("The given email must be set")

        GlobalUserModel = apps.get_model(
            self.model._meta.app_label, self.model._meta.object_name
        )
        username = GlobalUserModel.normalize_username(username)
        user = self.model(username=username, email=email, **extra_fields)
        user.password = make_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    username_validator = UnicodeUsernameValidator()
    username = models.CharField(
        _("username"),
        max_length=150,
        unique=False,
        help_text=_(
            "Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only."
        ),
        validators=[username_validator],
    )

    email = models.EmailField(_("email address"), unique=True)

    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)

    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can log into this admin site."),
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )

    objects = UserManager()

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        db_table = "users"

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)


    @property
    def current_task(self):
        actual_times = ActualTime.objects.none()
        plans = self.plan_set.all()
        for plan in plans:
            stages = plan.stage_set.all()
            for stage in stages:
                time_logs = stage.timelog_set.all()
                for time_log in time_logs:
                    actual_times = actual_times.union(time_log.actualtime_set.all())

        current_actual_time = actual_times.order_by("-date_started").first()
        if current_actual_time:
            current_task = current_actual_time.time_log.task
        else:
            current_task = None

        return current_task
