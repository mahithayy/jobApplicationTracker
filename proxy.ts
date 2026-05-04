import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
  void request;
  return NextResponse.next();
}
