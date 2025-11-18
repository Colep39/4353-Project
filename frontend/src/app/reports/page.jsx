"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportFilters from "./components/ReportFilters";
import VolunteerReportTable from "./components/VolunteerReportTable";
import EventReportTable from "./components/EventReportTable";
import ExportButtons from "./components/ExportButtons";
import { fetchWithAuth } from "../authHelper";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

export default function ReportsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [reportType, setReportType] = useState("volunteers");
  const [filters, setFilters] = useState({});
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!API_URL) return;

    async function fetchReport() {
      try {
        const query = new URLSearchParams(filters).toString();
        const url = `${API_URL}/api/reports/${reportType}?${query}`;

        const res = await fetchWithAuth(url);

        if (!res.ok) {
          console.error("Error fetching report:", res.status);
          setData([]);
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching report:", err);
        setData([]);
      }
    }

    fetchReport();
  }, [reportType, filters]);

  return (
    <div
      className={`${outfit.className} min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 p-8`}
    >
      {/* PAGE CONTENT CONTAINER */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
            Reports Dashboard
          </h1>

          {/* EXPORT BUTTON */}
          <ExportButtons reportType={reportType} filters={filters} />
        </div>

        {/* TABS */}
        <Tabs value={reportType} onValueChange={setReportType} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto rounded-xl bg-white shadow">
            <TabsTrigger
              value="volunteers"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all"
            >
              Volunteer Participation
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all"
            >
              Event Assignments
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* FILTER PANEL (no longer sticky) */}
        <div className="mt-2">
          <Card className="shadow-lg border border-gray-200">
            <div className="p-4">
              <ReportFilters onChange={setFilters} />
            </div>
          </Card>
        </div>

        {/* DATA TABLE */}
        <Card className="p-6 shadow-xl border border-gray-200">
          {reportType === "volunteers" ? (
            <VolunteerReportTable data={data} />
          ) : (
            <EventReportTable data={data} />
          )}
        </Card>
      </div>
    </div>
  );
}
