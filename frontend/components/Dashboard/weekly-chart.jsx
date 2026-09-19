"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle,
} from "@/components/ui/card"

import {
ChartContainer,
ChartTooltip,
ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
{ day: "Mon", hours: 1.5 },
{ day: "Tue", hours: 2.2 },
{ day: "Wed", hours: 3.1 },
{ day: "Thu", hours: 2.6 },
{ day: "Fri", hours: 4.0 },
{ day: "Sat", hours: 3.5 },
{ day: "Sun", hours: 2.8 },
]

const chartConfig = {
hours: {
label: "Time Spent",
color: "var(--chart-1)",
},
}

export default function WeeklyStudentTimeChart() {
return ( <Card className="pt-0"> <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row"> <div className="grid flex-1 gap-1"> <CardTitle>Weekly Activity</CardTitle>

      <CardDescription>
        Student time spent on the website this week
      </CardDescription>
    </div>
  </CardHeader>

  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[250px] w-full"
    >
      <AreaChart
        data={chartData}
        margin={{
          left: 8,
          right: 8,
          top: 10,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient
            id="fillHours"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="var(--color-hours)"
              stopOpacity={0.8}
            />

            <stop
              offset="95%"
              stopColor="var(--color-hours)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} />

        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />

        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={40}
          tickFormatter={(value) => `${value}h`}
        />

        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={(value) => [
                `${Number(value).toFixed(1)} hours`,
                "Time Spent",
              ]}
            />
          }
        />

        <Area
          dataKey="hours"
          type="natural"
          fill="url(#fillHours)"
          stroke="var(--color-hours)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  </CardContent>
</Card>

)
}
