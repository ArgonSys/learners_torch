import datetime


def in_date(dt, d):
    """datetimeがdate内にあるかを判定

    Args:
        dt (datetime.datetime): datetime
        d (datetime.date): date
    """
    return datetime.timedelta() <= dt - d < datetime.timedelta(days=1)
