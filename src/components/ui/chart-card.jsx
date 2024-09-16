import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function ChartCard({ title, chart, summary, className, contentClassName, ...props }) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn(chart ? "p-0" : "", contentClassName)}>
        {chart ? (
          chart
        ) : summary ? (
          <>
            <div className="text-2xl font-bold">{summary.value}</div>
            <p className="text-xs text-muted-foreground">{summary.change}</p>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}