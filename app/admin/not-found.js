import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function AdminNotFound() {
  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>Sorry, the admin page you're looking for doesn't exist.</p>
          <p>Check the URL and try again.</p>
          <Button asChild className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}