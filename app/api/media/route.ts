export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 获取今天和昨天的日期范围
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 获取所有活跃的媒体
    const mediaList = await db
      .selectFrom("media")
      .selectAll()
      .where("active", "=", true)
      .execute();

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    // 获取每个媒体今天和昨天的统计数据
    const [todayCounts, yesterdayCounts, weekCounts] = await Promise.all([
      // 今天的统计
      db
        .selectFrom("site_url")
        .select(["media_id", db.fn.count<string>("id").as("count")])
        .where("time", ">=", today)
        .where("time", "<", tomorrow)
        .groupBy("media_id")
        .execute(),

      // 昨天的统计
      db
        .selectFrom("site_url")
        .select(["media_id", db.fn.count<string>("id").as("count")])
        .where("time", ">=", yesterday)
        .where("time", "<", today)
        .groupBy("media_id")
        .execute(),

      db
        .selectFrom("site_url")
        .select(["media_id", db.fn.count<string>("id").as("count")])
        .where("time", ">=", weekAgo)
        .where("time", "<", tomorrow)
        .groupBy("media_id")
        .execute(),
    ]);

    // 组合数据
    const data = mediaList.map((media) => ({
      ...media,
      todayCount: Number(
        todayCounts.find((item) => item.media_id === media.id)?.count ?? 0
      ),
      yesterdayCount: Number(
        yesterdayCounts.find((item) => item.media_id === media.id)?.count ?? 0
      ),
      weekCount: Number(
        weekCounts.find((item) => item.media_id === media.id)?.count ?? 0
      ),
    }));

    return Response.json({ data });
  } catch (error) {
    console.error("Database query error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
