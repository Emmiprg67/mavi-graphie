import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "@/lib/adminAuth";
import { cloudinary } from "@/lib/media";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = process.env.DEBUG_INVENTORY_TOKEN;
  const provided = request.headers.get("x-debug-token");
  if (!token || provided === null || !timingSafeEqual(provided, token)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const resources: unknown[] = [];
  let nextCursor: string | undefined;

  do {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "mavi-graphie/uploads",
      max_results: 500,
      next_cursor: nextCursor,
    });
    resources.push(
      ...result.resources.map((r: Record<string, unknown>) => ({
        public_id: r.public_id,
        format: r.format,
        bytes: r.bytes,
        width: r.width,
        height: r.height,
        created_at: r.created_at,
      })),
    );
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return NextResponse.json({ count: resources.length, resources });
}
