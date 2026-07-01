# System4Learn — Go-to-Market Plan

## 1. Target Segments (Wedge First)

### Primary: Small Coaching Institutes (≤ 500 students)
**Why them first:**  
- Already served by the product (fee management, leads, admin roles)  
- Pain is felt personally by the owner — no procurement committee  
- Budget is ₹500–₹2,000/month — doesn't need CFO sign-off  
- Referral density is high: owner-to-owner word of mouth in city clusters (Pune, Ahmedabad, Jaipur, Lucknow)

**Personas:**  
- *Branch owner* — runs 2–5 branches, tired of WhatsApp for fee reminders and Excel for leads  
- *Class admin* — needs teacher attendance, student progress, parent communication in one place

### Secondary: Mid-size Schools (500–2,000 students)
- Needs multi-branch structure, parent app, and real-time fee tracking  
- Longer sales cycle but higher ACV  
- Target after 10 coaching-institute logos and a reference case study

### Expansion: External Students / Parents (B2C)
- Study challenges, AI quiz, flashcard generation are unique to this product  
- B2C pricing via `StudentPlan` / `ParentPlan` models (already in schema)  
- Only viable once institute adoption creates demand from students of those institutes

---

## 2. Pricing

Tied directly to the existing `SubscriptionPackage` / `ParentPlan` / `StudentPlan` models in the schema.

### Institute Plans

| Plan | Price/month | Limits | Who buys it |
|---|---|---|---|
| **Starter** | Free forever | 1 branch, 50 students, no AI | Try-before-you-buy |
| **Growth** | ₹999 | 3 branches, 500 students, 100 AI quizzes/month | Small institutes |
| **Scale** | ₹2,499 | Unlimited branches, 5,000 students, unlimited AI | Growing chains |
| **Enterprise** | Custom | White-label, SLA, custom integrations | Large schools |

### Student / Parent Plans (B2C, after institute launch)

| Plan | Price/month | What they get |
|---|---|---|
| **Student Free** | ₹0 | Access to content shared by institute only |
| **Student Pro** | ₹199 | Unlimited AI quizzes, flashcards, challenges |
| **Parent Basic** | ₹0 | View child's progress shared by institute |
| **Parent Plus** | ₹149 | Real-time attendance, AI progress reports, direct chat |

---

## 3. Channel Strategy

### Month 1–2: Founder-led direct sales
- Personal outreach to 50 coaching institutes in your city (LinkedIn + WhatsApp)  
- Offer a free 30-day setup + data migration  
- Record a 5-minute Loom demo covering: admin login → add student → fee collection → AI quiz  
- Target: 5 paying institutes by end of month 2

### Month 2–3: Content + Community
- LinkedIn posts every Tuesday (auto-drafted by `marketing_draft.py`)  
- YouTube: 1 screen-recording tutorial/week ("How to send fee reminders to 200 students in 2 minutes")  
- WhatsApp group of institute owners (invite-only, 30–50 members): share tips, collect feedback  
- Instagram: testimonial clips from admin users once you have 2–3 logos

### Month 3–6: Referral loop
- Every paying institute gets a unique referral code  
- Successful referral = 1 month free for referrer + 20% discount for the referred institute  
- This is the highest-ROI channel for the coaching-institute segment

### Month 6+: Partnerships
- CA firms and GST consultants who already serve institutes — white-label or reseller deal  
- EdTech content providers: pre-load quiz banks, split revenue  
- State education boards: pilot with 1 district, aim for government contract

---

## 4. Week-1 Metrics

Track these from day one — they tell you whether the product is landing.

| Metric | Target (Week 1) | Signal |
|---|---|---|
| Demo requests | ≥ 5 | Top-of-funnel is working |
| Free-tier signups | ≥ 10 | Product is accessible |
| Accounts with ≥ 1 student added | ≥ 5 | Users are activating, not just signing up |
| Accounts with ≥ 1 fee recorded | ≥ 3 | Core value action reached |
| AI quiz generated | ≥ 10 | AI differentiator is being discovered |
| Support requests | track all | Input for triage agent |
| Paid conversions | ≥ 1 | Revenue viability check |

**North Star Metric:** Number of institutes with ≥ 1 fee recorded in the past 30 days  
(= an institute actively using the product for real money movement)

---

## 5. Competitive Positioning

| vs. | Their weakness | System4Learn's edge |
|---|---|---|
| Excel + WhatsApp | No automation, no AI, no single source of truth | Everything in one place, AI-first |
| Teachmint / Classplus | Feature-heavy, complex onboarding, one-size-fits-all | Lean, customisable roles, AI quiz/flashcard built-in |
| ERP software (Fedena) | Built for schools, overkill for coaching, desktop-first | Mobile-first, cloud-native, modern UX |
| None (paper) | Error-prone, no reporting, delayed collections | Digital-first with minimal change management |

**One-line pitch:**  
> "System4Learn is the AI-powered admin platform that coaching institutes use instead of WhatsApp groups and Excel sheets — so owners spend less time chasing fees and more time teaching."

---

## 6. First 90-Day Action Plan

| Week | Action | Owner | Tool |
|---|---|---|---|
| 1 | Deploy + smoke test all 8 roles on system4learn.com | You | Phases 3–5 done |
| 1 | Record 5-min Loom demo | You | Loom |
| 1–2 | DM 50 coaching institute owners on LinkedIn | You | LinkedIn |
| 2 | Set up weekly marketing_draft.py + daily health_check.py | You | ops-agents/ |
| 2 | Launch WhatsApp group for beta users | You | WhatsApp |
| 3 | Onboard first 3 institutes (free, hands-on) | You | Direct |
| 4 | First paying customer | You | Razorpay / UPI |
| 5–6 | First case study (screenshot + quote) | You | Canva |
| 7–8 | Referral program live | You | Coupon codes in schema |
| 10–12 | 10 paying institutes | You | North Star |
