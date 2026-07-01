"""
Fee management: structures, discounts, student profiles, receipts.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from ..config.database import supabase
from ..models.auth import get_current_user
import uuid

router = APIRouter(prefix="/api/fees", tags=["fees"])


class FeeStructureCreate(BaseModel):
    name: str
    academic_year: str
    total_amount: float
    class_id: str
    branch_id: str
    payment_mode: str = "Lumpsum"
    late_fee_per_day: float = 0
    institute_id: str
    installments: Optional[List[dict]] = []


class DiscountCreate(BaseModel):
    name: str
    type: str = "Percentage"
    value: float
    institute_id: str


class FeeProfileCreate(BaseModel):
    student_id: str
    academic_year: str
    fee_structure_id: Optional[str] = None
    total_fee: float
    total_discount: float = 0
    net_payable: float
    institute_id: str
    installments: Optional[List[dict]] = []
    applied_discounts: Optional[List[dict]] = []


class PaymentRequest(BaseModel):
    fee_profile_id: str
    installment_id: str
    amount_paid: float
    payment_mode: str = "Cash"
    student_id: str
    institute_id: str


# ─── Fee Structures ───────────────────────────────────────────────────────────

@router.get("/structures")
async def list_fee_structures(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    return supabase.table("fee_structures").select("*, fee_structure_installments(*)").eq("institute_id", iid).execute().data


@router.post("/structures", status_code=status.HTTP_201_CREATED)
async def create_fee_structure(data: FeeStructureCreate, current_user: dict = Depends(get_current_user)):
    payload = data.model_dump(exclude={"installments"})
    row = supabase.table("fee_structures").insert(payload).execute().data[0]

    if data.installments:
        inst_rows = [
            {"fee_structure_id": row["id"], "name": i.get("name"), "percentage": i.get("percentage"),
             "due_date": i.get("dueDate"), "order_index": idx}
            for idx, i in enumerate(data.installments)
        ]
        supabase.table("fee_structure_installments").insert(inst_rows).execute()

    return row


@router.delete("/structures/{structure_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fee_structure(structure_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("fee_structures").delete().eq("id", structure_id).execute()


# ─── Discounts ────────────────────────────────────────────────────────────────

@router.get("/discounts")
async def list_discounts(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    return supabase.table("discounts").select("*").eq("institute_id", iid).execute().data


@router.post("/discounts", status_code=status.HTTP_201_CREATED)
async def create_discount(data: DiscountCreate, current_user: dict = Depends(get_current_user)):
    return supabase.table("discounts").insert(data.model_dump()).execute().data[0]


@router.delete("/discounts/{discount_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_discount(discount_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("discounts").delete().eq("id", discount_id).execute()


# ─── Student Fee Profiles ────────────────────────────────────────────────────

@router.get("/profiles")
async def list_fee_profiles(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    return supabase.table("student_fee_profiles").select(
        "*, student_installments(*), student_applied_discounts(*)"
    ).eq("institute_id", iid).execute().data


@router.get("/profiles/student/{student_id}")
async def get_student_fee_profile(student_id: str, academic_year: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = supabase.table("student_fee_profiles").select("*, student_installments(*), student_applied_discounts(*)").eq("student_id", student_id)
    if academic_year:
        query = query.eq("academic_year", academic_year)
    return query.execute().data


@router.post("/profiles", status_code=status.HTTP_201_CREATED)
async def create_fee_profile(data: FeeProfileCreate, current_user: dict = Depends(get_current_user)):
    payload = data.model_dump(exclude={"installments", "applied_discounts"})
    profile = supabase.table("student_fee_profiles").insert(payload).execute().data[0]

    if data.installments:
        inst_rows = [
            {
                "fee_profile_id": profile["id"],
                "installment_number": i + 1,
                "due_date": inst.get("dueDate"),
                "amount_due": inst.get("amountDue"),
                "amount_paid": 0,
                "late_fee_applied": 0,
                "status": "Pending",
            }
            for i, inst in enumerate(data.installments)
        ]
        supabase.table("student_installments").insert(inst_rows).execute()

    if data.applied_discounts:
        disc_rows = [
            {"fee_profile_id": profile["id"], "discount_id": d.get("discountId"),
             "name": d.get("name"), "applied_amount": d.get("appliedAmount")}
            for d in data.applied_discounts
        ]
        supabase.table("student_applied_discounts").insert(disc_rows).execute()

    return profile


# ─── Record Payment ───────────────────────────────────────────────────────────

@router.post("/payment")
async def record_payment(req: PaymentRequest, current_user: dict = Depends(get_current_user)):
    # Update installment
    inst = supabase.table("student_installments").select("*").eq("id", req.installment_id).maybe_single().execute().data
    if not inst:
        raise HTTPException(status_code=404, detail="Installment not found")

    receipt_number = f"RCP-{uuid.uuid4().hex[:8].upper()}"
    receipt = supabase.table("fee_receipts").insert({
        "receipt_number": receipt_number,
        "student_id": req.student_id,
        "payment_date": "today",
        "amount_paid": req.amount_paid,
        "payment_mode": req.payment_mode,
        "paid_for": f"Payment for Installment {inst['installment_number']}",
        "institute_id": req.institute_id,
    }).execute().data[0]

    new_paid = inst["amount_paid"] + req.amount_paid
    new_status = "Paid" if new_paid >= inst["amount_due"] else "Partially Paid"
    supabase.table("student_installments").update({
        "amount_paid": new_paid,
        "status": new_status,
        "payment_date": "today",
        "receipt_id": receipt["id"],
    }).eq("id", req.installment_id).execute()

    return receipt


@router.get("/receipts/student/{student_id}")
async def get_student_receipts(student_id: str, current_user: dict = Depends(get_current_user)):
    return supabase.table("fee_receipts").select("*").eq("student_id", student_id).order("created_at", desc=True).execute().data
