"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

const columns = [
  { key: "full_name", label: "Volunteer" },
  { key: "email", label: "Email" },
  { key: "event_name", label: "Event" },
  { key: "event_start_date", label: "Start" },
  { key: "event_end_date", label: "End" },
  { key: "event_urgency", label: "Urgency" },
  { key: "user_skills_len", label: "Skill Count" },
];

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}


export default function VolunteerReportTable({ data = [] }) {
  const [sortConfig, setSortConfig] = useState({
    key: "full_name",
    direction: "asc",
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const sortedData = useMemo(() => {
    const copy = [...data];
    const { key, direction } = sortConfig;

    copy.sort((a, b) => {
      const av = a[key];
      const bv = b[key];

      // numeric sort if both are numbers
      if (typeof av === "number" && typeof bv === "number") {
        return direction === "asc" ? av - bv : bv - av;
      }

      // fallback to string compare
      return direction === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return copy;
  }, [data, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const startIdx = (page - 1) * rowsPerPage;
  const pageData = sortedData.slice(startIdx, startIdx + rowsPerPage);

  const handleSort = (key) => {
    setPage(1);
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  if (!data || data.length === 0) {
    return <p className="text-gray-500">No volunteer data found.</p>;
  }

  const showingFrom = sortedData.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rowsPerPage, sortedData.length);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 px-0"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {pageData.map((row, index) => (
            <TableRow key={index} className="hover:bg-gray-50">
              <TableCell>{row.full_name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.event_name}</TableCell>
              <TableCell>{formatDate(row.event_start_date)}</TableCell>
              <TableCell>{formatDate(row.event_end_date)}</TableCell>
              <TableCell>{row.event_urgency}</TableCell>
              <TableCell>{row.user_skills_len}</TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination footer */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-muted-foreground">
          Showing {showingFrom}–{showingTo} of {sortedData.length}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="font-medium">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
