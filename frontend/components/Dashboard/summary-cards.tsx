"use client"

import {
  BookOpen,
  TrendingUp,
  Clock3,
  ClipboardList,
} from "lucide-react"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

const summaryCards = [
  {
    title: "Enrolled Courses",
    value: "4",
    description: "Courses you're currently enrolled in",
    icon: BookOpen,
  },
  {
    title: "Overall Progress",
    value: "72%",
    description: "Average progress across your courses",
    icon: TrendingUp,
  },
  {
    title: "Study Time This Week",
    value: "12h 35m",
    description: "Total learning time this week",
    icon: Clock3,
  },
  {
    title: "Assignments Due",
    value: "3",
    description: "Upcoming assignments",
    icon: ClipboardList,
  },
]

export function SummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => {
        const Icon = card.icon

        return (
          <Card
            key={card.title}
            className="border-border/60 shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>

                  <p className="text-3xl font-bold tracking-tight">
                    {card.value}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}