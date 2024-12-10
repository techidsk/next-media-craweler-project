export const dynamic = 'force-dynamic'

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Received POST request:', new Date().toISOString());
    const body = await request.json();
    console.log('Request body:', body);
    const size = Number(body.pageSize || 20);
    const page = Number(body.page || 1);
    const title = body.title || "";
    const { startTime, endTime } = body;
    const offset = (page - 1) * size;

    // 如果没有指定时间范围，默认使用最近一年（使用UTC+8时区）
    const now = new Date();
    const utcOffset = 8; // UTC+8
    const localNow = new Date(now.getTime() + utcOffset * 60 * 60 * 1000);
    const defaultStartTime = new Date(localNow.getTime() - 365 * 24 * 60 * 60 * 1000);
    const defaultEndTime = localNow;

    let baseQuery = db
      .selectFrom("site_url")
      .where("media_id", "=", Number(params.id))
      .where("time", ">=", startTime ? new Date(new Date(startTime).getTime() + utcOffset * 60 * 60 * 1000) : defaultStartTime)
      .where("time", "<=", endTime ? new Date(new Date(endTime).getTime() + utcOffset * 60 * 60 * 1000) : defaultEndTime);

    if (title.trim()) {
      baseQuery = baseQuery.where((eb) =>
        eb.or([eb("title", "like", `%${title}%`)])
      );
    }

    const [countResult, items] = await Promise.all([
      baseQuery
        .select(db.fn.count<string>("id").as("count"))
        .executeTakeFirst(),
      baseQuery
        .selectAll()
        .orderBy("id", "desc")
        .limit(size)
        .offset(offset)
        .execute(),
    ]);

    const total = Number(countResult?.count ?? 0);

    return NextResponse.json(
      {
        items: items,
        total,
        totalPages: Math.ceil(total / size),
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media data" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const items = await db
      .selectFrom("site_url")
      .where("media_id", "=", Number(params.id))
      .select(["url", "title"])
      .orderBy("id", "desc")
      .limit(100)
      .execute();

    return NextResponse.json({ items }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media data" },
      { status: 500 }
    );
  }
}
