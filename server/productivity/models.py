from my_django_app.fields import CustomModel
from my_django_app import fields


class Schedule(CustomModel):

    FREQ_CHOICES = [
        (0, "Yearly"),
        (1, "Monthly"),
        (2, "Weekly"),
        (3, "Daily"),
        (4, "Hourly"),
        (5, "Minutely"),
        (6, "Secondly"),
    ]

    WEEKDAY_CHOICES = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    ]

    freq = fields.ChoiceIntegerField(FREQ_CHOICES, 3)
    interval = fields.LimitedDecimalField(1, None, 1)
    by_week_day = fields.ChoicesStringArrayField(
        ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
    )
    by_month_day = fields.ChoicesNumberArrayField(range(1, 32))
    by_month = fields.ChoicesNumberArrayField(range(1, 13))
    by_year_day = fields.ChoicesNumberArrayField(range(1, 367))
    by_week_no = fields.ChoicesNumberArrayField(range(1, 54))
    by_hour = fields.ChoicesNumberArrayField(range(0, 24))
    by_minute = fields.ChoicesNumberArrayField(range(0, 60))
    by_second = fields.ChoicesNumberArrayField(range(0, 60))
    by_set_position = fields.ChoicesNumberArrayField(range(-31, 32))

    count = fields.OptionalLimitedDecimalField(1)
    start_date = fields.DefaultTodayField()
    end_date = fields.OptionalDateField()
    start_time = fields.OptionalLimitedTimeField()
    end_time = fields.OptionalLimitedTimeField()

    week_start = fields.ChoiceIntegerField(WEEKDAY_CHOICES)

    class Meta:
        abstract = True


class Task(Schedule):
    title = fields.ShortCharField(display=True)
    is_archived = fields.DefaultBooleanField(False)
    importance = fields.LimitedDecimalField(0, 10)

    def __str__(self):
        return self.title


class Event(CustomModel):
    task = fields.CascadeOptionalForeignKey(Task)
