import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserProfileSchema, ensureDatabaseTables } from "@/lib/db-sync";
import { checkAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Check admin access or secret header
    const authHeader = request.headers.get("x-sync-secret");
    const isSecretAuthorized =
      authHeader &&
      process.env.ADMIN_JWT_SECRET &&
      authHeader === process.env.ADMIN_JWT_SECRET;

    if (!isSecretAuthorized) {
      const auth = await checkAdminAccess(request);
      if (!auth.authorized) {
        return auth.response;
      }
    }

    // 2. Execute explicit schema sync
    await ensureUserProfileSchema();
    const result = await ensureDatabaseTables();

    // 3. Inspect columns of UserProfile
    const userProfileCols = await prisma.$queryRawUnsafe<Array<{ column_name: string; data_type: string }>>(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'UserProfile'
      ORDER BY column_name;
    `);

    return NextResponse.json({
      success: true,
      message: "Database schema synchronized successfully.",
      userProfileColumns: userProfileCols.map((c) => c.column_name),
      details: result,
    });
  } catch (error: any) {
    console.error("POST /api/v1/admin/sync-schema error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
