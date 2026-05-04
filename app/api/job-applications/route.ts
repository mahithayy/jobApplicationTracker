import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board, Column, JobApplication } from "@/lib/models";
import { checkRateLimit } from "@/lib/rate-limit";
import { jobApplicationSchema } from "@/lib/validations/job-application";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = checkRateLimit(session.user.id, 10, 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before adding more jobs." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedFields = jobApplicationSchema.safeParse(body);
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: validatedFields.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const {
      company,
      position,
      location,
      notes,
      salary,
      jobUrl,
      columnId,
      boardId,
      tags,
      description,
    } = validatedFields.data;

    await connectDB();

    const board = await Board.findOne({ _id: boardId, userId: session.user.id });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const column = await Column.findOne({ _id: columnId, boardId });
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    const maxOrder = (await JobApplication.findOne({ columnId })
      .sort({ order: -1 })
      .select("order")
      .lean()) as { order: number } | null;

    const jobApplication = await JobApplication.create({
      company,
      position,
      location,
      notes,
      salary,
      jobUrl,
      columnId,
      boardId,
      userId: session.user.id,
      tags: tags || [],
      description,
      status: "applied",
      order: maxOrder ? maxOrder.order + 100 : 0,
    });

    await Column.findByIdAndUpdate(columnId, {
      $push: { jobApplications: jobApplication._id },
    });

    revalidatePath("/dashboard");
    return NextResponse.json({
      data: JSON.parse(JSON.stringify(jobApplication)),
    });
  } catch (error) {
    console.error("POST /api/job-applications failed:", error);
    return NextResponse.json(
      { error: "Failed to save job application to the database." },
      { status: 500 }
    );
  }
}
