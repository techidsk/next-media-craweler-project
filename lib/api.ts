import axios from "axios";
import { MediaResponse, MediaSearchParams } from "./types";
import dayjs from "dayjs";

export async function fetchMediaData({
  mediaId,
  page,
  title = "",
  pageSize = 20,
  startTime,
  endTime,
}: MediaSearchParams): Promise<MediaResponse> {
  const response = await fetch(`/api/media/${mediaId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
    },
    body: JSON.stringify({
      page,
      title,
      pageSize,
      startTime,
      endTime,
    }),
  });
  return response.json();
}

export async function searchCount(params: {
  start_time: Date;
  end_time: Date;
  mediaId: number;
}) {
  const response = await axios.post("/api/media/count", {
    start_time: dayjs(params.start_time).format("YYYY-MM-DD HH:mm:ss"),
    end_time: dayjs(params.end_time).format("YYYY-MM-DD HH:mm:ss"),
    media_id: params.mediaId,
  }, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
    }
  });

  return response.data;
}
