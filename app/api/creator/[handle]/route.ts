import { NextRequest, NextResponse } from "next/server";
import { sanitizeHandle, getCreatorPageData } from "@/lib/creators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const sanitized = sanitizeHandle(handle);
  if (!sanitized) {
    return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
  }

  const data = await getCreatorPageData(sanitized);
  return NextResponse.json(data);
}
