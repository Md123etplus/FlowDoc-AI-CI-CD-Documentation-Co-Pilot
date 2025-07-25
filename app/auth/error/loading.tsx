import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function AuthErrorLoading() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-4 w-60 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  )
}
