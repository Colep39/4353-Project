"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportFilters from "./components/ReportFilters";
import VolunteerReportTable from "./components/VolunteerReportTable";
import EventReportTable from "./components/EventReportTable";
import ExportButtons from "./components/ExportButtons";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

export default function ReportsPage() {
  const [reportType, setReportType] = useState("volunteers");
  const [filters, setFilters] = useState({});
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchReport() {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/reports/${reportType}?${query}`);
      const json = await res.json();
      setData(json);
    }

    fetchReport();
  }, [filters, reportType]);

  return (
    <div className={` ${outfit.className} min-h-screen p-8 space-y-8`}>

      <h1 className="text-4xl font-bold tracking-tight">Reports</h1>

      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="volunteers">Volunteer Participation</TabsTrigger>
          <TabsTrigger value="events">Event Assignments</TabsTrigger>
        </TabsList>
      </Tabs>

      <ReportFilters onChange={setFilters} />

      <Card className="p-6 shadow">
        {reportType === "volunteers" ? (
          <VolunteerReportTable data={data} />
        ) : (
          <EventReportTable data={data} />
        )}
      </Card>

      <ExportButtons reportType={reportType} filters={filters} />

    </div>
  );
}
