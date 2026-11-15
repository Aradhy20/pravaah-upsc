# Pravaah UPSC — Payment Operations Runbook

This runbook guides customer support, database administrators, and engineering on managing day-to-day payment operations, investigating student payment issues, handling bank reconciliation discrepancies, and managing refund workflows.

---

## 1. Quick Reference & Core Operating Principles

| Operation | Tool / Location | Responsible Role | SLA |
|---|---|---|---|
| Student reports payment debit but screen expired | Admin Dashboard -> `/admin/payments` -> **Verify Status** | Tier 1 Support | < 15 minutes |
| Missing Webhook Delivery | Gateway Admin -> Outbox / Logs | Tier 2 Support | < 30 minutes |
| Duplicate Debit / Refund Request | Admin Dashboard -> Issue Refund | Finance / Admin | < 24 hours |
| Bank UTR Search & Manual Provisioning | Admin Payments Search (`UTR: ...`) | Tier 2 Support | < 1 hour |

### Cardinal Rules of Financial State
1. **Never grant entitlements manually in the database without a verified bank UTR or Gateway Order ID.**
2. **Never mark an order as PAID based purely on student screenshot.** Always verify the UTR against the gateway `/orders/:id` endpoint or bank settlement report.
3. **Late recoveries are automated**: If money was debited just as the 15-minute countdown expired, the gateway's late webhook (`order.paid`) or a manual status refresh will automatically transition the order from `EXPIRED` to `PAID` and grant the student access.

---

## 2. Common Incident Workflows

### Incident A: Student Paid via UPI, Money Debited, but Status is PENDING or EXPIRED

#### Root Cause Analysis
1. The student made payment via their UPI app (GPay/PhonePe/Paytm) within the last 30 seconds of the 15-minute window.
2. The NPCI/Bank settlement arrived at the gateway after the frontend timer reached 0.
3. The gateway webhook was delayed by network jitter or queue backlog.

#### Resolution Steps
1. Ask the student for their **12-digit UPI Reference / UTR Number** and **Registered Email ID**.
2. Open the Pravaah UPSC Admin Dashboard at `/admin/payments`.
3. Filter by the student's email or paste the internal Order ID (starts with `UPICHECKOUT_...`).
4. Click the **Verify Status** button next to the order.
   - This triggers `GET /api/v1/payments/orders/[orderId]/status?sync=true`.
   - The backend queries the external gateway (`GET /api/v1/orders/[id]`).
   - If the gateway confirms payment, the order automatically transitions to `PAID`, updates the UTR, and triggers atomic entitlement provisioning.
5. Confirm that the student's dashboard now shows their active tier (e.g. *Syllabus Sprint*, *Prelims Pro*, or *Ranker Suite*).

---

### Incident B: Gateway Webhook Signature Verification Failures (HTTP 401)

#### Root Cause Analysis
If `/api/webhooks/upi-gateway` starts returning HTTP 401 across multiple requests:
1. The `UPI_GATEWAY_WEBHOOK_SECRET` environment variable in Vercel does not match the secret in the Laravel Gateway Merchant settings.
2. A proxy or CDN (Cloudflare, AWS WAF) is modifying or re-encoding the raw JSON request body before it reaches Next.js.
3. Server clock drift between the gateway host and Vercel edge exceeds 300 seconds (5 minutes).

#### Diagnostic Checks
1. Check gateway outbound logs:
   - Examine the `X-Signature` header format: `t=TIMESTAMP,v1=HASH`.
   - Check the time difference: `Math.abs(Date.now() / 1000 - timestamp)`. If > 300, NTP clock sync is failing on the gateway server.
2. Run NTP clock sync on the Gateway server:
   ```bash
   sudo timedatectl set-ntp on
   sudo systemctl restart systemd-timesyncd
   timedatectl status
   ```
3. Test signing using the manual CLI verification script:
   ```bash
   node tests/upi_gateway_integration.test.mjs
   ```

---

### Incident C: Handling Refund Requests

When a student is granted a refund per Pravaah UPSC's refund policy:

1. **Locate Payment**: Find the student's `PaymentOrder` in `/admin/payments`.
2. **Execute Gateway Refund**: Process the refund through the Gateway Admin or banking dashboard.
3. **Revoke Entitlement**:
   - Access database or Admin User Management:
     ```typescript
     // Revoke subscription
     await prisma.subscription.updateMany({
       where: { userId: targetUserId, status: 'ACTIVE' },
       data: { status: 'CANCELLED', endsAt: new Date() }
     });
     
     // Update user flags
     await prisma.user.update({
       where: { id: targetUserId },
       data: { isPaidMember: false, tier: 'FREE' }
     });
     
     // Mark order REFUNDED
     await prisma.paymentOrder.update({
       where: { clientOrderId: targetOrderId },
       data: { status: 'REFUNDED' }
     });
     ```
4. **Audit Log**: Add a note with the refund transaction reference in the customer ticket.

---

## 3. Database Emergency Queries (Prisma & SQL)

### Find Recent Stuck Pending Orders (> 20 minutes old)
```sql
SELECT 
    id, "clientOrderId", "userId", amount, "createdAt", "expiresAt"
FROM "PaymentOrder"
WHERE status = 'PENDING'
  AND "createdAt" < NOW() - INTERVAL '20 minutes'
ORDER BY "createdAt" DESC;
```

### Check Webhook Ingestion Log for a Specific Order
```sql
SELECT 
    "eventId", "eventType", "processed", "errorMessage", "createdAt"
FROM "PaymentWebhookEvent"
WHERE "rawPayload"::text LIKE '%UPICHECKOUT_YOUR_ORDER_ID%'
ORDER BY "createdAt" DESC;
```

### Verify Student Active Subscriptions
```sql
SELECT 
    u.id, u.email, u."isPaidMember", u.tier, s.plan, s.status, s."endsAt"
FROM "User" u
LEFT JOIN "Subscription" s ON s."userId" = u.id
WHERE u.email = 'student@example.com';
```

---

## 4. Key Metrics and Alerting Thresholds

Set up alerts on your monitoring dashboard (Vercel Analytics, Datadog, Sentry, or Grafana):

1. **Webhook 401 Rate**: > 2% over 5 minutes -> Alert on webhook secret mismatch.
2. **Gateway Timeout Rate (504 / UpiGatewayNetworkError)**: > 5 occurrences in 10 minutes -> Alert on external gateway degradation.
3. **Pending Order Stagnation**: Ratio of `PENDING` orders > 25% of total orders over 1 hour -> Alert on webhook delivery outage.
4. **Late Payment Recovery Spike**: Monitored for sudden surges in bank delays during high-traffic mock test registrations.
