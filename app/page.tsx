"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, Link, Spinner, Input } from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface MediaItem {
  id: string;
  name: string;
  alias: string;
  active: boolean;
  todayCount: number;
  yesterdayCount: number;
  weekCount: number;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { data: mediaList, isLoading } = useQuery({
    queryKey: ["mediaList"],
    queryFn: async () => {
      const response = await axios.get("/api/media");
      const { data } = response.data;

      const result = data.sort((a: any, b: any) => a.id - b.id);
      return result;
    },
  });

  // 筛选媒体列表
  const filteredMediaList = mediaList?.filter((media: MediaItem) =>
    media.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spinner
          size="lg"
          color="primary"
          label="加载中..."
          labelColor="primary"
        />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-6 py-8 max-w-7xl bg-white">
      <h1 className="text-3xl font-bold mb-8 text-blue-600 border-b pb-2">
        媒体列表
      </h1>

      {/* 搜索框 */}
      <div className="mb-6">
        <Input
          classNames={{
            base: "max-w-full sm:max-w-[50%]",
            mainWrapper: "h-full",
            input: "text-small",
            inputWrapper: "h-full font-normal text-default-500 bg-default-50",
          }}
          placeholder="搜索媒体名称..."
          size="sm"
          startContent={
            <MagnifyingGlassIcon className="w-4 h-4 text-default-400" />
          }
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        n
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMediaList?.map((media: MediaItem) => (
          <Card
            key={media.id}
            isPressable
            onPress={() =>
              router.push(
                `/media/${media.id}?name=${encodeURIComponent(media.name)}`
              )
            }
            className="hover:scale-[1.02] transition-all duration-200 shadow-sm bg-gray-50"
          >
            <CardBody className="p-5">
              <div className="flex flex-col gap-2">
                <div className="text-lg font-semibold text-primary">
                  {media.name}
                </div>
                <div className="text-sm text-default-400">
                  今日: {media.todayCount} | 昨日: {media.yesterdayCount} |
                </div>
                <div className="text-sm text-default-400">
                  一周:{media.weekCount}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </main>
  );
}
