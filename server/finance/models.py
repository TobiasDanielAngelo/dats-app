from my_django_app import fields
from my_django_app.utils import CannotEqual
from django.db.models import Sum
from commerce.models import Sale, Purchase, Labor
from .utils import generate_check
from django.utils import timezone
from datetime import timedelta

TYPE_CHOICES = [
    (0, "Cash"),
    (1, "Coins"),
    (2, "Cash + Coins"),
    (3, "Savings"),
    (4, "Credit"),
    (5, "Checking"),
    (6, "Mortgage"),
    (7, "Stocks"),
    (8, "Assets"),
    (9, "Liabilities"),
    (10, "Untracked"),
]


class Account(fields.CustomModel):

    name = fields.ShortCharField(display=True)
    type = fields.ChoiceIntegerField(TYPE_CHOICES)

    @property
    def net_balance_dated(self):
        now = timezone.now()
        today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

        inflow = (
            self.transaction_going_to.filter(
                datetime_transacted__lte=today_end
            ).aggregate(total=Sum("amount"))["total"]
            or 0
        )

        outflow = (
            self.transaction_coming_from.filter(
                datetime_transacted__lte=today_end
            ).aggregate(total=Sum("amount"))["total"]
            or 0
        )

        return inflow - outflow

    @property
    def net_balance_post_dated(self):

        inflow = self.transaction_going_to.aggregate(total=Sum("amount"))["total"] or 0

        outflow = (
            self.transaction_coming_from.aggregate(total=Sum("amount"))["total"] or 0
        )

        return inflow - outflow

    @property
    def days_til_zero(self):
        """
        Returns the number of days from TODAY until the balance crosses zero.
        Returns -1 if the balance never crosses zero in the future (or already crossed in the past).
        """
        from collections import defaultdict
        from datetime import timedelta
        from decimal import Decimal

        # Get all transactions sorted by date
        inflow_txns = self.transaction_going_to.values_list(
            "datetime_transacted", "amount"
        )
        outflow_txns = self.transaction_coming_from.values_list(
            "datetime_transacted", "amount"
        )

        # Combine and sort all transactions
        all_txns = []
        for dt, amount in inflow_txns:
            all_txns.append((dt, amount, "in"))
        for dt, amount in outflow_txns:
            all_txns.append((dt, -amount, "out"))

        if not all_txns:
            return -1

        all_txns.sort(key=lambda x: x[0])

        today = timezone.now().date()

        # Get the first transaction date and last transaction date
        first_txn_date = all_txns[0][0].date()
        last_txn_date = all_txns[-1][0].date()

        # Track running balance
        running_balance = Decimal("0")
        was_positive = True

        # Group transactions by date
        txns_by_date = defaultdict(lambda: Decimal("0"))
        for dt, amount, _ in all_txns:
            date_key = dt.date()
            txns_by_date[date_key] += amount

        # Iterate through each day from first transaction to last transaction
        current_date = first_txn_date
        while current_date <= last_txn_date:
            # Update running balance if there are transactions on this day
            if current_date in txns_by_date:
                running_balance += txns_by_date[current_date]

            # Only check for crossings on or after today
            if current_date >= today:
                is_positive = running_balance > 0

                if was_positive and not is_positive:
                    # We just crossed into zero/negative territory
                    # Return days from today to this crossing date
                    return (current_date - today).days

                was_positive = is_positive
            else:
                # Track state even for past dates
                was_positive = running_balance > 0

            current_date += timedelta(days=1)

        # Balance never crosses zero in the future
        return -1

    @property
    def worst_average_value(self):
        """Returns the most negative daily average value."""
        worst_data = self._calculate_worst_average()
        return worst_data["average"] if worst_data else 0

    @property
    def worst_peak_day(self):
        """Returns the date when the worst daily average occurred."""
        worst_data = self._calculate_worst_average()
        return worst_data["date"] if worst_data else None

    def _calculate_worst_average(self):
        """
        Helper method to calculate the worst daily average.
        For each day from today onwards (including post-dated transactions):
        - Calculate cumulative balance (inflow - outflow from start to that day)
        - Divide by number of days from today to that day
        - Track the minimum (most negative) average
        """
        # Get all transactions sorted by date
        inflow_txns = self.transaction_going_to.values_list(
            "datetime_transacted", "amount"
        )
        outflow_txns = self.transaction_coming_from.values_list(
            "datetime_transacted", "amount"
        )

        # Combine and sort all transactions
        all_txns = []
        for dt, amount in inflow_txns:
            all_txns.append((dt, amount, "in"))
        for dt, amount in outflow_txns:
            all_txns.append((dt, -amount, "out"))

        if not all_txns:
            return None

        all_txns.sort(key=lambda x: x[0])

        today = timezone.now().date()

        # Track running balance and worst average
        running_balance = 0
        worst_average = float("inf")
        worst_date = None

        # Group transactions by date for efficiency
        txns_by_date = {}
        for dt, amount, _ in all_txns:
            date_key = dt.date()
            if date_key not in txns_by_date:
                txns_by_date[date_key] = 0
            txns_by_date[date_key] += amount

        # Get all transaction dates
        all_dates = sorted(txns_by_date.keys())

        # Calculate running balance for each date
        for current_date in all_dates:
            # Skip past dates (before today)
            if current_date < today:
                running_balance += txns_by_date[current_date]
                continue

            # Update running balance
            running_balance += txns_by_date[current_date]

            # Calculate days from today to this date (add 1 to include today)
            days_from_today = (current_date - today).days + 1

            # Calculate daily average
            daily_average = running_balance / days_from_today

            # Track worst (most negative) average
            if daily_average < worst_average:
                worst_average = daily_average
                worst_date = current_date

        return {
            "average": worst_average if worst_average != float("inf") else 0,
            "date": worst_date,
        }


NATURE_CHOICES = [
    (0, "Outgoing"),
    (1, "Incoming"),
    (2, "Transfer"),
    (3, "Receivable"),
    (4, "Payable"),
]


class Category(fields.CustomModel):
    title = fields.ShortCharField(display=True)
    nature = fields.ChoiceIntegerField(NATURE_CHOICES)


class Transaction(fields.CustomModel):
    image = fields.ImageField("transactions")
    sale = fields.CascadeOptionalForeignKey(Sale)
    purchase = fields.CascadeOptionalForeignKey(Purchase)
    labor = fields.CascadeOptionalForeignKey(Labor)
    category = fields.SetNullOptionalForeignKey(Category, display=True)
    description = fields.MediumCharField(display=True)
    coming_from = fields.SetNullOptionalForeignKey(Account, display=True)
    going_to = fields.SetNullOptionalForeignKey(Account, display=True)
    amount = fields.AmountField()
    datetime_transacted = fields.DefaultNowField()
    to_print = fields.DefaultBooleanField(False)

    @property
    def nature(self):
        return self.category.get_nature_display()

    def generate_transaction_check(self):
        generate_check(self)

    class Meta:
        constraints = [CannotEqual("coming_from", "going_to", "Transaction")]


class Receivable(fields.CustomModel):
    charge = fields.CascadeOptionalForeignKey(Transaction)
    payments = fields.OptionalManyToManyField(Transaction)
    name = fields.ShortCharField(display=True)
    amount = fields.AmountField()
    description = fields.MediumCharField(display=True)
    date_due = fields.OptionalDateField()

    @property
    def payment_total(self):
        return sum(p.amount for p in self.payments.all())

    @property
    def date_completed(self):
        total = self.payments.aggregate(total=Sum("amount"))["total"] or 0
        if total >= self.amount:
            return (
                self.payments.order_by("-created_at")
                .values_list("created_at", flat=True)
                .first()
                .date()
            )
        return None


class Payable(fields.CustomModel):
    charge = fields.CascadeOptionalForeignKey(Transaction)
    payments = fields.OptionalManyToManyField(Transaction)
    name = fields.ShortCharField(display=True)
    amount = fields.AmountField(display=True)
    description = fields.MediumCharField(display=True)
    date_due = fields.OptionalDateField()

    @property
    def payment_total(self):
        return sum(p.amount for p in self.payments.all())

    @property
    def date_completed(self):
        total = self.payments.aggregate(total=Sum("amount"))["total"] or 0
        if total >= self.amount:
            return (
                self.payments.order_by("-created_at")
                .values_list("created_at", flat=True)
                .first()
                .date()
            )
        return None
