import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Column, JobApplication } from "@/lib/models";
import { updateJobApplicationSchema } from "@/lib/validations/job-application";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession(request.headers);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const validatedFields = updateJobApplicationSchema.safeParse(body);
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: validatedFields.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();
    const jobApplication = await JobApplication.findById(id);

    if (!jobApplication) {
      return NextResponse.json(
        { error: "Job application not found" },
        { status: 404 }
      );
    }

    if (jobApplication.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { columnId, order, ...otherUpdates } = validatedFields.data;
    const updatesToApply: Partial<{
      company: string;
      position: string;
      location: string;
      notes: string;
      salary: string;
      jobUrl: string;
      columnId: string;
      order: number;
      tags: string[];
      description: string;
    }> = otherUpdates;

    const currentColumnId = jobApplication.columnId.toString();
    const newColumnId = columnId?.toString();
    const isMovingToDifferentColumn =
      newColumnId && newColumnId !== currentColumnId;

    if (isMovingToDifferentColumn) {
      await Column.findByIdAndUpdate(currentColumnId, {
        $pull: { jobApplications: id },
      });

      const jobsInTargetColumn = await JobApplication.find({
        columnId: newColumnId,
        _id: { $ne: id },
      })
        .sort({ order: 1 })
        .lean();

      let newOrderValue: number;

      if (order !== undefined && order !== null) {
        newOrderValue = order * 100;

        const jobsThatNeedToShift = jobsInTargetColumn.slice(order);
        for (const job of jobsThatNeedToShift) {
          await JobApplication.findByIdAndUpdate(job._id, {
            $set: { order: job.order + 100 },
          });
        }
      } else {
        const lastJobOrder =
          jobsInTargetColumn[jobsInTargetColumn.length - 1]?.order || 0;
        newOrderValue = jobsInTargetColumn.length > 0 ? lastJobOrder + 100 : 0;
      }

      updatesToApply.columnId = newColumnId;
      updatesToApply.order = newOrderValue;

      await Column.findByIdAndUpdate(newColumnId, {
        $push: { jobApplications: id },
      });
    } else if (order !== undefined && order !== null) {
      const otherJobsInColumn = await JobApplication.find({
        columnId: currentColumnId,
        _id: { $ne: id },
      })
        .sort({ order: 1 })
        .lean();

      const currentJobOrder = jobApplication.order || 0;
      const currentPositionIndex = otherJobsInColumn.findIndex(
        (job) => job.order > currentJobOrder
      );
      const oldPositionIndex =
        currentPositionIndex === -1
          ? otherJobsInColumn.length
          : currentPositionIndex;

      const newOrderValue = order * 100;

      if (order < oldPositionIndex) {
        const jobsToShiftDown = otherJobsInColumn.slice(order, oldPositionIndex);

        for (const job of jobsToShiftDown) {
          await JobApplication.findByIdAndUpdate(job._id, {
            $set: { order: job.order + 100 },
          });
        }
      } else if (order > oldPositionIndex) {
        const jobsToShiftUp = otherJobsInColumn.slice(oldPositionIndex, order);
        for (const job of jobsToShiftUp) {
          const newOrder = Math.max(0, job.order - 100);
          await JobApplication.findByIdAndUpdate(job._id, {
            $set: { order: newOrder },
          });
        }
      }

      updatesToApply.order = newOrderValue;
    }

    const updated = await JobApplication.findByIdAndUpdate(id, updatesToApply, {
      new: true,
    });

    revalidatePath("/dashboard");
    return NextResponse.json({
      data: JSON.parse(JSON.stringify(updated)),
    });
  } catch (error) {
    console.error("PATCH /api/job-applications/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to update job application in the database." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getSession(_request.headers);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await connectDB();
    const jobApplication = await JobApplication.findById(id);

    if (!jobApplication) {
      return NextResponse.json(
        { error: "Job application not found" },
        { status: 404 }
      );
    }

    if (jobApplication.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Column.findByIdAndUpdate(jobApplication.columnId, {
      $pull: { jobApplications: id },
    });

    await JobApplication.deleteOne({ _id: id });
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/job-applications/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to delete job application from the database." },
      { status: 500 }
    );
  }
}
