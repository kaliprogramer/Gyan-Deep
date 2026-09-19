"use client";
import { SummaryCards } from "@/components/Dashboard/summary-cards";
import ChartAreaInteractive from "@/components/Dashboard/weekly-chart";
export default function Home() {
  return (
    <>
      <div className="px-4 pb-2">
        <SummaryCards />
      </div>
      <div className="px-4 pb-2">
        <ChartAreaInteractive />
      </div>
    </>
  );
}
