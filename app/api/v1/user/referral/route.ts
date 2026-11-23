import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    let referral = await prisma.referral.findFirst({
      where: { referrerUserId: user.id },
    });

    if (!referral) {
      const code = `PRAVAAH-${user.fullName.split(" ")[0].toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      try {
        referral = await prisma.referral.create({
          data: {
            referrerUserId: user.id,
            referralCode: code,
          },
        });
      } catch {
        referral = {
          id: "ref_default",
          referrerUserId: user.id,
          referredUserId: null,
          referralCode: code,
          status: "ACTIVE",
          rewardPoints: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }

    const successfulReferrals = await prisma.referral.findMany({
      where: { referrerUserId: user.id, status: { in: ["QUALIFIED", "REWARDED"] } },
      include: { referredUser: { select: { fullName: true, createdAt: true } } },
    });

    return NextResponse.json({
      success: true,
      data: {
        referralCode: referral.referralCode,
        rewardPoints: referral.rewardPoints,
        shareUrl: `https://pravaah-upsc.vercel.app/register?ref=${referral.referralCode}`,
        totalReferralsCount: successfulReferrals.length,
        referrals: successfulReferrals.map((r) => ({
          referredName: r.referredUser?.fullName || "Aspirant",
          date: r.createdAt,
          status: r.status,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/user/referral:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve referral profile" },
      { status: 500 }
    );
  }
}
