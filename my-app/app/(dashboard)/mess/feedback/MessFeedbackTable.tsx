"use client";

import { DataTable } from "@/components/common/DataTable";
import { Star } from "lucide-react";
import { format } from "date-fns";

type FeedbackRow = any & {
  profiles?: { full_name: string };
};

interface MessFeedbackTableProps {
  feedback: FeedbackRow[];
}

export function MessFeedbackTable({ feedback }: MessFeedbackTableProps) {
  const columns = [
    {
      key: "student",
      header: "Student",
      cell: (row: FeedbackRow) => row.profiles?.full_name ?? "Anonymous Student",
    },
    {
      key: "meal_type",
      header: "Meal",
      cell: (row: FeedbackRow) => <span className="capitalize font-medium">{row.meal_type}</span>,
    },
    {
      key: "rating",
      header: "Rating",
      cell: (row: FeedbackRow) => (
        <div className="flex items-center gap-1 font-bold text-amber-500">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span>{row.rating} / 5</span>
        </div>
      ),
    },
    {
      key: "comment",
      header: "Comment",
      cell: (row: FeedbackRow) => row.comment || "—",
    },
    {
      key: "date",
      header: "Date",
      cell: (row: FeedbackRow) => format(new Date(row.date), "d MMM yyyy"),
    },
  ];

  return (
    <DataTable
      data={(feedback ?? []) as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search feedback..."
      pageSize={15}
      emptyTitle="No feedback received today"
      rowKey={(row: any) => row.id}
    />
  );
}
