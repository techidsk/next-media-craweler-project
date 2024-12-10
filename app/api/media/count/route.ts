export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { start_time, end_time, media_id } = await request.json();
    const utcOffset = 8; // UTC+8

    // 调整时区
    const startTime = new Date(new Date(start_time).getTime() + utcOffset * 60 * 60 * 1000);
    const endTime = new Date(new Date(end_time).getTime() + utcOffset * 60 * 60 * 1000);

    const result = await db
      .selectFrom("site_url")
      .select(db.fn.count<string>("id").as("count"))
      .where("media_id", "=", media_id)
      .where("time", ">=", startTime)
      .where("time", "<=", endTime)
      .executeTakeFirst();

    return Response.json({
      count: Number(result?.count ?? 0),
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
  } catch (error) {
    console.error("Count query error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
