"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function CampaignNotFound() {
  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Campaign Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>Sorry, the campaign you're looking for doesn't exist.</p>
          <p>Check the URL and try again.</p>
        </CardContent>
      </Card>
    </div>
  )
}