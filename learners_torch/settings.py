"""
Django settings for learners_torch project.

Generated by 'django-admin startproject' using Django 5.0.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

import os
from os import environ
import dj_database_url
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = environ.get("DJANGO_SECRET_KEY", "")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = environ.get("DJANGO_DEBUG", "").lower() == "true"

ALLOWED_HOSTS = ["127.0.0.1", "localhost", "learners-torch.onrender.com"]


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "betterforms",
    "users.apps.UsersConfig",
    "plans.apps.PlansConfig",
    "stages.apps.StagesConfig",
    "tasks.apps.TasksConfig",
    "time_logs.apps.TimeLogsConfig",
    "profiles.apps.ProfilesConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "learners_torch.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "users.context_processors.get_context",
            ],
        },
    },
]

WSGI_APPLICATION = "learners_torch.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES_AVAILABLE = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "learners_torch_" + environ.get("APP_ENV", ""),
        "USER": environ.get("MYSQL_USER", ""),
        "PASSWORD": environ.get("MYSQL_PASSWORD", ""),
        "HOST": environ.get("MYSQL_HOST", ""),
        "PORT": environ.get("MYSQL_PORT", ""),
    },
    "postgresql": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "learners_torch_" + environ.get("APP_ENV", ""),
        "USER": environ.get("POSTGRESQL_USER", ""),
        "PASSWORD": environ.get("POSTGRESQL_PASSWORD", ""),
        "HOST": environ.get("POSTGRESQL_HOST", ""),
        "PORT": environ.get("POSTGRESQL_PORT", ""),
    },
    "product": dj_database_url.config(default=environ.get("DATABASE_URL", "")),
}

database = environ.get("DJANGO_DATABASE", "default")

DATABASES = {"default": DATABASES_AVAILABLE[database]}


AUTH_USER_MODEL = "users.User"

LOGIN_URL = "users:login"
LOGIN_REDIRECT_URL = "top"
LOGOUT_REDIRECT_URL = "top"

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

SUPERUSER_NAME = environ.get("SUPERUSER_NAME")
SUPERUSER_EMAIL = environ.get("SUPERUSER_EMAIL")
SUPERUSER_PASSWORD = environ.get("SUPERUSER_PASSWORD")

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = "ja"

TIME_ZONE = "Asia/Tokyo"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static/"]
STATIC_ROOT = BASE_DIR / "staticfiles/"

MEDIA_ROOT = BASE_DIR / "media"
MEDIA_URL = "/media/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARN",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}
