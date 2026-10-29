import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface StudySlot {
  time: string;
  focus: string;
  activity: string;
  durationMinutes: number;
}

interface CustomSchedule {
  targetExam: string;
  preparationStage: string;
  dailyHours: number;
  targetDate: string;
  prioritySubjects: string[];
  revisionStrategy: string;
  slots: StudySlot[];
  weeklyStrategy: string[];
  calculatedDaysRemaining: number;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const {
      targetExam = "UPSC CSE 2025",
      preparationStage = "INTERMEDIATE",
      dailyHours = 6,
      targetDate = "2025-05-25",
      prioritySubjects = ["Polity & Governance", "Economy", "Modern History"],
      revisionStrategy = "SPACED_REPETITION",
    } = body;

    const targetTime = new Date(targetDate).getTime();
    const nowTime = new Date().getTime();
    const calculatedDaysRemaining = Math.max(
      1,
      Math.ceil((targetTime - nowTime) / (1000 * 60 * 60 * 24))
    );

    // Formulate feasible daily time allocation based on hours
    const slots: StudySlot[] = [];
    const hours = Math.max(2, Math.min(14, Number(dailyHours)));

    if (hours <= 4) {
      slots.push({
        time: "07:00 - 09:00",
        focus: prioritySubjects[0] || "Polity & Governance",
        activity: "Core standard book study + 15 PYQs in Learn Mode",
        durationMinutes: 120,
      });
      slots.push({
        time: "20:00 - 21:00",
        focus: "Daily Current Affairs & Quiz",
        activity: "Read verified PIB/The Hindu cards + solve today's 5-question quiz",
        durationMinutes: 60,
      });
      slots.push({
        time: "21:00 - 22:00",
        focus: "Mistake Revision",
        activity: "Spaced-repetition revision queue on past errors",
        durationMinutes: 60,
      });
    } else if (hours <= 7) {
      slots.push({
        time: "06:30 - 09:00",
        focus: prioritySubjects[0] || "Polity & Governance",
        activity: "Deep theoretical concepts + 25 topic PYQs",
        durationMinutes: 150,
      });
      slots.push({
        time: "10:30 - 12:30",
        focus: prioritySubjects[1] || "Economy & Budget",
        activity: "Macro trends, key committee reports & previous paper drill",
        durationMinutes: 120,
      });
      slots.push({
        time: "15:00 - 16:30",
        focus: "Current Affairs & Syllabus Mapping",
        activity: "Source-aware news cards + daily 5-question test",
        durationMinutes: 90,
      });
      slots.push({
        time: "18:00 - 19:30",
        focus: "CSAT / Revision",
        activity:
          preparationStage === "REVISION_AND_MOCKS"
            ? "Full paper simulation analysis & weak-topic drill"
            : "Analytical reasoning & reading comprehension practice",
        durationMinutes: 90,
      });
    } else {
      // 8+ hours full-time aspirant
      slots.push({
        time: "06:00 - 08:30",
        focus: prioritySubjects[0] || "Polity & Governance",
        activity: "Foundational syllabus mastery & active recall",
        durationMinutes: 150,
      });
      slots.push({
        time: "09:30 - 12:00",
        focus: prioritySubjects[1] || "Economy & Environment",
        activity: "Analytical concepts + historical trend questions",
        durationMinutes: 150,
      });
      slots.push({
        time: "13:30 - 15:30",
        focus: prioritySubjects[2] || "History & Geography",
        activity: "NCERT/Standard reference mapping + map work",
        durationMinutes: 120,
      });
      slots.push({
        time: "16:30 - 18:00",
        focus: "Daily Current Affairs Intelligence",
        activity: "PIB/Ministry summaries + daily quiz + mistake tagging",
        durationMinutes: 90,
      });
      slots.push({
        time: "19:30 - 21:00",
        focus: "CSAT & Mathematical Reasoning",
        activity: "Official CSAT paper questions & mental math heuristics",
        durationMinutes: 90,
      });
      slots.push({
        time: "21:30 - 22:30",
        focus: "Spaced Repetition & Day Wrap",
        activity: "Resolve red flags in mistake revision queue",
        durationMinutes: 60,
      });
    }

    const weeklyStrategy = [
      "Monday–Friday: Core syllabus mastery, daily current affairs, and 20 topic PYQs.",
      "Saturday: 2-hour timed full-length paper simulation (+2.0 / -0.666 negative marking).",
      "Sunday: Diagnostic error analysis on weak topics (<60% accuracy) and spaced-repetition catch-up.",
    ];

    const plan: CustomSchedule = {
      targetExam,
      preparationStage,
      dailyHours: hours,
      targetDate,
      prioritySubjects,
      revisionStrategy,
      slots,
      weeklyStrategy,
      calculatedDaysRemaining,
    };

    return NextResponse.json({
      success: true,
      data: plan,
      isPersonalized: Boolean(user),
      user: user
        ? { id: user.id, fullName: user.fullName }
        : null,
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/study-planner/custom:", error);
    return NextResponse.json(
      { success: false, error: "Failed to formulate custom study schedule" },
      { status: 500 }
    );
  }
}
