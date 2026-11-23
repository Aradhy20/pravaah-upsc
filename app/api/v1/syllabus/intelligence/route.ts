import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    // 1. Fetch all subjects and their topics with subtopics and counts
    const subjects = await prisma.subject.findMany({
      include: {
        paper: true,
        topics: {
          include: {
            subtopics: true,
            _count: { select: { questions: true } },
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // 2. Fetch UserTopicProgress if authenticated
    const userProgressMap: Record<string, { status: string; confidence: number; notes: string | null }> = {};
    if (user) {
      const records = await prisma.userTopicProgress.findMany({
        where: { userId: user.id },
      });
      for (const r of records) {
        userProgressMap[r.topicId] = {
          status: r.status,
          confidence: r.confidence,
          notes: r.notes,
        };
      }
    }

    // Standard syllabus reference mapping dictionary
    const STANDARD_REFERENCES: Record<string, { ncert: string; book: string; mains: string }> = {
      "Preamble & Constitutional Features": {
        ncert: "NCERT Class 11: Indian Constitution at Work, Chapter 1 & 2",
        book: "M. Laxmikanth, Indian Polity (7th Ed.), Chapters 1, 3, 4",
        mains: "Constitutionalism, Basic Structure Doctrine, Federal balance",
      },
      "Fundamental Rights & DPSP": {
        ncert: "NCERT Class 11: Indian Constitution at Work, Chapter 2: Rights in the Indian Constitution",
        book: "M. Laxmikanth, Indian Polity (7th Ed.), Chapters 7, 8, 9",
        mains: "Enforceability of DPSP, Article 21 expansive interpretation, Right to Privacy",
      },
      "Parliament & State Legislatures": {
        ncert: "NCERT Class 11: Indian Constitution at Work, Chapter 5: Legislature",
        book: "M. Laxmikanth, Indian Polity (7th Ed.), Chapters 22, 23, 24",
        mains: "Parliamentary decline, committee system, anti-defection law (10th Schedule)",
      },
      "Union & State Executive": {
        ncert: "NCERT Class 11: Indian Constitution at Work, Chapter 4: Executive",
        book: "M. Laxmikanth, Indian Polity (7th Ed.), Chapters 17, 18, 30, 31",
        mains: "Presidential discretion, Governor Article 200 assent, civil services neutrality",
      },
      "Judiciary & Constitutional Bodies": {
        ncert: "NCERT Class 11: Indian Constitution at Work, Chapter 6: Judiciary",
        book: "M. Laxmikanth, Indian Polity (7th Ed.), Chapters 26, 27, 43, 44",
        mains: "Collegium system vs NJAC, judicial overreach, Election Commission autonomy",
      },
      "Fiscal & Monetary Policy": {
        ncert: "NCERT Class 12: Introductory Macroeconomics, Chapter 5",
        book: "Ramesh Singh, Indian Economy, Chapters 5, 6, 7",
        mains: "FRBM glidepath, fiscal federalism, monetary policy transmission",
      },
      "National Income & Growth": {
        ncert: "NCERT Class 12: Introductory Macroeconomics, Chapter 2",
        book: "Ramesh Singh, Indian Economy, Chapter 1 & 2",
        mains: "GDP vs GVA, inclusive growth, structural transformation of employment",
      },
      "Climate Change & Conventions": {
        ncert: "NCERT Class 12: Biology, Chapter 16: Environmental Issues",
        book: "Shankar IAS Environment, Chapters 17, 18 (UNFCCC, Paris Agreement)",
        mains: "Common But Differentiated Responsibilities (CBDR), Loss & Damage Fund, COP summits",
      },
      "Number System & Divisibility": {
        ncert: "NCERT Class 6–10 Mathematics",
        book: "CSAT Manual / Quantitative Aptitude (RS Aggarwal)",
        mains: "Prelims Paper II qualifying benchmark (33% threshold)",
      },
      "Percentages, Ratio & Proportions": {
        ncert: "NCERT Class 7–8 Mathematics",
        book: "CSAT Quantitative Aptitude by Arun Sharma",
        mains: "Prelims Paper II qualifying benchmark (33% threshold)",
      },
    };

    // 3. Format full tree
    const formattedSubjects = subjects.map((sub) => {
      const topics = sub.topics.map((t) => {
        const userProg = userProgressMap[t.id] || {
          status: "NOT_STARTED",
          confidence: 0.0,
          notes: null,
        };
        const ref = STANDARD_REFERENCES[t.name] || {
          ncert: "NCERT General Foundation Classes 9–12",
          book: "Standard Subject Reference Manual",
          mains: "General Studies Syllabus Core Theme",
        };

        return {
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description,
          pyqCount: t._count.questions,
          userStatus: userProg.status,
          userConfidence: userProg.confidence,
          userNotes: userProg.notes,
          subtopics: t.subtopics.map((st) => ({
            id: st.id,
            name: st.subtopicName,
          })),
          learningResources: {
            ncert: ref.ncert,
            standardBook: ref.book,
            mainsTheme: ref.mains,
            learningPath: ["Read", "Understand", "Practice", "Revise", "Test", "Master"],
          },
        };
      });

      return {
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        paperCode: sub.paper?.code || "GS1",
        paperName: sub.paper?.name || "General Studies",
        topicsCount: topics.length,
        masteredCount: topics.filter((t) => t.userStatus === "MASTERED").length,
        inProgressCount: topics.filter((t) => t.userStatus === "LEARNING" || t.userStatus === "PRACTISED").length,
        topics,
      };
    });

    // 4. Calculate total metrics
    const allTopics = formattedSubjects.flatMap((s) => s.topics);
    const totalTopics = allTopics.length;
    const masteredTotal = allTopics.filter((t) => t.userStatus === "MASTERED").length;
    const learningTotal = allTopics.filter((t) => t.userStatus === "LEARNING").length;
    const practisedTotal = allTopics.filter((t) => t.userStatus === "PRACTISED").length;
    const revisionTotal = allTopics.filter((t) => t.userStatus === "NEEDS_REVISION").length;
    const notStartedTotal = allTopics.filter((t) => t.userStatus === "NOT_STARTED").length;

    return NextResponse.json({
      success: true,
      data: {
        authenticated: !!user,
        summary: {
          totalTopics,
          masteredCount: masteredTotal,
          learningCount: learningTotal,
          practisedCount: practisedTotal,
          needsRevisionCount: revisionTotal,
          notStartedCount: notStartedTotal,
          overallPercentage: totalTopics > 0 ? Number(((masteredTotal / totalTopics) * 100).toFixed(1)) : 0,
        },
        subjects: formattedSubjects,
      },
    });
  } catch (error: any) {
    console.error("GET /api/v1/syllabus/intelligence error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load syllabus intelligence map" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to update topic progress" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { topicId, status, confidence, notes } = body;

    if (!topicId || !status) {
      return NextResponse.json(
        { success: false, error: "topicId and status are required fields" },
        { status: 400 }
      );
    }

    const validStatuses = ["NOT_STARTED", "LEARNING", "PRACTISED", "NEEDS_REVISION", "MASTERED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const progress = await prisma.userTopicProgress.upsert({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId,
        },
      },
      create: {
        userId: user.id,
        topicId,
        status,
        confidence: confidence !== undefined ? parseFloat(confidence) : 0.5,
        notes: notes || null,
        lastStudiedAt: new Date(),
      },
      update: {
        status,
        confidence: confidence !== undefined ? parseFloat(confidence) : undefined,
        notes: notes !== undefined ? notes : undefined,
        lastStudiedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        topicId: progress.topicId,
        status: progress.status,
        confidence: progress.confidence,
        notes: progress.notes,
        lastStudiedAt: progress.lastStudiedAt,
      },
    });
  } catch (error: any) {
    console.error("POST /api/v1/syllabus/intelligence error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update topic progress" },
      { status: 500 }
    );
  }
}
