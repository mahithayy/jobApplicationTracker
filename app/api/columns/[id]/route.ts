import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board, Column, JobApplication } from "@/lib/models";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getSession(request.headers);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await connectDB();

    // 1. Find the column to ensure it exists
    const column = await Column.findById(id);
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    // 2. Verify the user owns the parent board
    const board = await Board.findOne({ _id: column.boardId, userId: session.user.id });
    if (!board) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 3. Cascade Delete: Remove all job applications that were inside this column
    await JobApplication.deleteMany({ columnId: id });

    // 4. Remove the column ID from the parent Board's array
    await Board.findByIdAndUpdate(column.boardId, {
      $pull: { columns: id },
    });

    // 5. Finally, delete the column itself
    await Column.deleteOne({ _id: id });

    revalidatePath("/dashboard");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/columns/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to delete column." },
      { status: 500 }
    );
  }
}