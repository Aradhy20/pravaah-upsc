import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin privileges required" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file") || "question_bank_coverage.csv";

    // Allow only strictly whitelisted CSV files
    const allowedFiles = [
      "question_bank_coverage.csv",
      "source_discovery_results.csv",
      "duplicate_candidates.csv",
      "import_errors.csv",
    ];

    if (!allowedFiles.includes(fileName)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_FILE", message: "Requested export file is not permitted" } },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "exports", fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: { code: "FILE_NOT_FOUND", message: `Export file ${fileName} does not exist.` } },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/admin/export:", error);
    return NextResponse.json(
      { success: false, error: { code: "EXPORT_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
