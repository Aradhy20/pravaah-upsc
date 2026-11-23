# PRAVAAH UPSC — PHASE 6 FEATURE ENTITLEMENT ENGINE

**Architecture:** Server-Side Guardrails & Tier Evaluation  
**Service Location:** [`lib/entitlements.ts`](file:///Volumes/DevDrive/pravaah-upsc/lib/entitlements.ts)  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Core Mandate:** Zero Client-Side Trust; All Permissions Enforced Server-Side

---

## 1. Entitlement Architecture Model

```
[ Incoming Request with Session / x-user-id ]
                      │
                      ▼
         [ checkEntitlement(userId, featureKey) ]
                      │
    ┌─────────────────┴─────────────────┐
    ▼                                   ▼
[ Active Subscription Check ]       [ Fallback Tier 0 ]
- Query Subscription table          - If no active paid sub,
  where status == "ACTIVE"            defaults to Free Plan (Tier 0)
- Extract Plan Tier (0, 1, 2, 3)
    │                                   │
    └─────────────────┬─────────────────┘
                      ▼
        [ Feature Minimum Tier Check ]
- Compares userTier >= requiredTier
- Evaluates quota limits (Bookmarks, Notes, Daily PYQs)
- Returns { hasAccess: boolean, userTier, requiredTier, reason }
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[ Access Granted ]          [ Access Denied (HTTP 403) ]
- Proceed to Controller     - Emits structured JSON error:
                              "Feature requires Achiever or higher"
```

---

## 2. Server-Side Guarded Endpoints

| Endpoint Route | Guarded Feature | Required Tier | Failure Mode |
| :--- | :--- | :---: | :--- |
| `POST /api/v1/tests/session/start` | `TIMED_EXAMS` | Tier 1 (Plus) | HTTP 403 `FORBIDDEN_TIER` |
| `POST /api/v1/ai/mentor` | `AI_MENTOR` | Tier 2 (Pro) / Trial | HTTP 403 `AI_LIMIT_REACHED` |
| `POST /api/v1/mains/evaluate` | `MAINS_EVALUATION` | Tier 2 (Pro) / Trial | HTTP 403 `CREDIT_LIMIT_REACHED` |
| `POST /api/v1/user/bookmarks` | `BOOKMARKS_LIMIT` | Tier 0: 5, Tier 1: 50 | HTTP 403 `QUOTA_EXCEEDED` |
| `POST /api/v1/user/notes` | `NOTES_LIMIT` | Tier 0: 3, Tier 1: 50 | HTTP 403 `QUOTA_EXCEEDED` |
| `GET /api/v1/admin/revenue` | `ADMIN_ACCESS` | Role `ADMIN` | HTTP 401 / 403 `UNAUTHORIZED` |

---

## 3. Defense Against Client-Side Tampering

1. **No Client-Side State Trust:** Even if an attacker modifies the browser bundle or removes UI blur filters, every API request executes server-side validation against PostgreSQL.
2. **Expired Subscription Handling:** If `currentPeriodEnd < now()`, the subscription status is treated as expired, automatically dropping the effective tier to `0` (Free Aspirant).
3. **Cross-User Isolation:** All entitlement checks require verified session IDs matching `userId`. An aspirant cannot execute requests on another aspirant's quota.
