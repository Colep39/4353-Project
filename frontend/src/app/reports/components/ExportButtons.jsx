"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

export default function ExportButtons({ reportType, filters }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL; // ✅ Use your env style
  const query = new URLSearchParams(filters).toString();

  // Export endpoints now point to backend, not Next.js
  const basePath = `${API_URL}/api/reports/export/${reportType}`;

  return (
    <div className="flex justify-end pt-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Download as</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* CSV Export */}
          <DropdownMenuItem asChild>
            <a
              href={`${basePath}/csv?${query}`}
              className="flex items-center cursor-pointer"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              CSV
            </a>
          </DropdownMenuItem>

          {/* PDF Export */}
          <DropdownMenuItem asChild>
            <a
              href={`${basePath}/pdf?${query}`}
              className="flex items-center cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
