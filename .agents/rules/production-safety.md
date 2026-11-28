# Production Safety Rule

1. **Strict Data Preservation**:
   - Never drop tables, truncate collections, or accept destructive database operations in production.
   - Preserve all real user accounts, profile details, test history, and payment transactions.

2. **Safe Payment Posture**:
   - Keep `ENABLE_PAYMENTS=false` during beta testing and staging evaluation.
   - Never route live production payment keys to sandbox endpoints or sandbox keys to production endpoints.
   - Verify webhook signatures strictly with the raw request body.

3. **Authentication Hardening**:
   - Reject unverified session tokens.
   - Restrict test mocks strictly to test environments (`NODE_ENV === "test"`).
   - Ensure secrets are stored securely in environment variables and never logged or serialized to client responses.
