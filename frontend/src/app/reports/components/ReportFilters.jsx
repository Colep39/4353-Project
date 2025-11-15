"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ReportFilters({ onChange }) {
  const [localFilters, setLocalFilters] = useState({
    startDate: "",
    endDate: "",
    search: "",
    skill: "",
    minHours: "",
  });

  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  const updateFilters = (updated) => {
    setLocalFilters(updated);
    onChange(updated);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range || { from: undefined, to: undefined });

    const startDate =
      range?.from ? format(range.from, "yyyy-MM-dd") : "";
    const endDate =
      range?.to ? format(range.to, "yyyy-MM-dd") : "";

    updateFilters({
      ...localFilters,
      startDate,
      endDate,
    });
  };

  const updateField = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    updateFilters(updated);
  };

  const dateLabel =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(
          dateRange.to,
          "MMM d, yyyy"
        )}`
      : "Select date range";

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Range Picker */}
        <div className="flex flex-col gap-2">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-full",
                  !dateRange?.from && !dateRange?.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Search */}
        <div>
          <Label>Search</Label>
          <Input
            placeholder="Search volunteer or event..."
            onChange={(e) => updateField("search", e.target.value)}
          />
        </div>

        {/* Skill Filter */}
        <div>
          <Label>Skill</Label>
          <Select onValueChange={(val) => updateField("skill", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cooking">Cooking</SelectItem>
              <SelectItem value="Setup">Setup</SelectItem>
              <SelectItem value="Registration">Registration</SelectItem>
              {/* You can later populate this from DB */}
            </SelectContent>
          </Select>
        </div>

        {/* Min hours */}
        <div>
          <Label>Minimum Hours</Label>
          <Input
            type="number"
            placeholder="e.g. 2"
            onChange={(e) => updateField("minHours", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
