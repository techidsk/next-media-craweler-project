"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input, Button, Table, Pagination, Link } from "@nextui-org/react";
import { fetchMediaData } from "@/lib/api";
import type { MediaItem } from "@/lib/types";
import {
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { DateRangePicker } from "@nextui-org/date-picker";

const columns = [
  {
    key: "site",
    label: "媒体",
  },
  {
    key: "title",
    label: "标题",
  },
  {
    key: "url",
    label: "地址",
    renderCell: (item: MediaItem) => (
      <Link href={item.url} isExternal showAnchorIcon>
        {item.url}
      </Link>
    ),
  },
  {
    key: "time",
    label: "⌛️时间",
    renderCell: (item: MediaItem) => (
      <span>
        {new Intl.DateTimeFormat('zh-CN', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(new Date(item.time))}
      </span>
    ),
  },
];

export default function MediaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const mediaId = params.id as string;
  const mediaName = searchParams.get("name");

  const [title, setTitle] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [dateRange, setDateRange] = React.useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 一年前
    end: new Date(), // 现在
  });
  const [inputPage, setInputPage] = React.useState('');

  // 使用 debounce 处理标题搜索
  const debouncedSetTitle = useDebouncedCallback((value: string) => {
    setTitle(value);
    setPage(1);
  }, 200);

  const { data, isLoading } = useQuery({
    queryKey: ["media", mediaId, page, title, dateRange.start, dateRange.end],
    queryFn: () =>
      fetchMediaData({
        mediaId,
        page,
        title,
        startTime: dateRange.start,
        endTime: dateRange.end,
        pageSize: 20,
      }),
  });

  const handleDateRangeChange = useCallback((range: any) => {
    setDateRange({
      start: range?.start ? new Date(range.start) : null,
      end: range?.end ? new Date(range.end) : null,
    });
    setPage(1);
  }, []);

  // 统一的页码更新处理函数
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage > 0 && newPage <= (data?.totalPages || 1)) {
      setPage(newPage);
      setInputPage('');
      // 可选：滚动到页面顶部
      window.scrollTo(0, 0);
    }
  }, [data?.totalPages]);

  // 跳转处理函数
  const handleJumpToPage = useCallback(() => {
    const pageNum = parseInt(inputPage);
    if (pageNum) {
      handlePageChange(pageNum);
    }
  }, [inputPage, handlePageChange]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600 border-b pb-2">
          {mediaName || mediaId}
        </h1>
        <Link href="/" color="primary" aria-label="返回首页">
          返回
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Input
          placeholder="搜索标题"
          defaultValue={title}
          onChange={(e) => debouncedSetTitle(e.target.value)}
          aria-label="搜索标题输入框"
          variant="bordered"
          radius="sm"
          classNames={{
            input: "h-14 text-black dark:text-white",
            inputWrapper: "h-14",
          }}
        />
        <DateRangePicker
          label="选择时间范围"
          onChange={handleDateRangeChange}
          color="primary"
          variant="bordered"
          radius="sm"
          classNames={{
            segment: [
              "[&[data-editable=true][data-placeholder=true]]:text-default-500",
              "[&[data-editable=true]]:text-primary",
              "focus:bg-primary-400/20",
              "data-[invalid=true]:text-danger",
            ],
            base: "h-14",
            input: "h-14",
          }}
          calendarProps={{
            classNames: {
              base: "bg-white dark:bg-background",
              headerWrapper: "pt-4 bg-white dark:bg-background",
              prevButton:
                "border-1 border-default-200 rounded-small text-black dark:text-white",
              nextButton:
                "border-1 border-default-200 rounded-small text-black dark:text-white",
              gridHeader:
                "bg-white dark:bg-background shadow-none border-b-1 border-default-100 text-black dark:text-white",
              cellButton: [
                "text-black dark:text-white",
                "data-[today=true]:bg-default-100 data-[selected=true]:bg-transparent rounded-small",
                // start (pseudo)
                "data-[range-start=true]:before:rounded-l-small",
                "data-[selection-start=true]:before:rounded-l-small",
                // end (pseudo)
                "data-[range-end=true]:before:rounded-r-small",
                "data-[selection-end=true]:before:rounded-r-small",
                // start (selected)
                "data-[selected=true]:data-[selection-start=true]:data-[range-selection=true]:rounded-small",
                // end (selected)
                "data-[selected=true]:data-[selection-end=true]:data-[range-selection=true]:rounded-small",
              ],
            },
          }}
          popoverProps={{
            placement: "bottom",
            offset: 10,
            classNames: {
              content: "bg-white dark:bg-gray-900",
            },
          }}
          aria-label="选择日期范围"
        />
      </div>

      <Table aria-label="媒体数据列表">
        <TableHeader>
          {columns.map((column) => (
            <TableColumn
              key={column.key}
              className="text-black dark:text-white"
              aria-label={column.label}
            >
              {column.label}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody items={data?.items || []}>
          {(item) => (
            <TableRow key={item.url}>
              {(columnKey) => (
                <TableCell className="text-black dark:text-white">
                  {columnKey === "url"
                    ? columns
                        .find((col) => col.key === columnKey)
                        ?.renderCell?.(item)
                    : item[columnKey as keyof MediaItem]}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center items-center gap-4 mt-4">
        <Pagination
          total={data?.totalPages || 1}
          page={page}
          onChange={handlePageChange}
          aria-label="页面导航"
        />
        <div className="flex items-center gap-2">
          <Input
            className="w-20"
            size="sm"
            placeholder="页码"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJumpToPage()}
          />
          <Button size="sm" onClick={handleJumpToPage}>
            跳转
          </Button>
        </div>
      </div>
    </div>
  );
}
