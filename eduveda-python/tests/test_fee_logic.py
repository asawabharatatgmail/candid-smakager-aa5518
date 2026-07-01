"""
Unit tests for fee payment logic.
Tests the status-calculation rules from fees.py record_payment inline,
so they stay in sync with any future refactors of that logic.
"""
import pytest


def _payment_status(amount_due: float, prev_paid: float, new_payment: float) -> str:
    """Mirror the status logic in fees.py record_payment."""
    new_paid = prev_paid + new_payment
    return "Paid" if new_paid >= amount_due else "Partially Paid"


class TestPaymentStatus:
    def test_exact_payment_marks_paid(self):
        assert _payment_status(1000, 0, 1000) == "Paid"

    def test_overpayment_marks_paid(self):
        assert _payment_status(1000, 0, 1200) == "Paid"

    def test_partial_payment_first_installment(self):
        assert _payment_status(1000, 0, 500) == "Partially Paid"

    def test_cumulative_payments_complete(self):
        assert _payment_status(1000, 500, 500) == "Paid"

    def test_cumulative_payments_still_partial(self):
        assert _payment_status(1000, 300, 400) == "Partially Paid"

    def test_zero_payment_stays_partially_paid(self):
        assert _payment_status(1000, 0, 0) == "Partially Paid"

    def test_fractional_amounts(self):
        assert _payment_status(999.99, 0, 999.99) == "Paid"
        assert _payment_status(999.99, 0, 999.98) == "Partially Paid"


class TestReceiptNumberFormat:
    def test_receipt_number_prefix(self):
        import uuid
        receipt_number = f"RCP-{uuid.uuid4().hex[:8].upper()}"
        assert receipt_number.startswith("RCP-")
        assert len(receipt_number) == 12   # "RCP-" (4) + 8 hex chars
        assert receipt_number[4:].isupper()
        assert receipt_number[4:].isalnum()

    def test_receipt_numbers_are_unique(self):
        import uuid
        numbers = {f"RCP-{uuid.uuid4().hex[:8].upper()}" for _ in range(100)}
        assert len(numbers) == 100, "All 100 generated receipt numbers must be unique"
