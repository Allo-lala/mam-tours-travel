"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { toZonedTime } from "date-fns-tz"

interface Booking {
  id: number
  startAt: string
  endAt: string
  hiredAt: string | null
  returnedAt: string | null
  purpose: string
  type: string
  status: string
  totalCost: number | null
  vehicle: {
    brand: string
    model: string | null
    plate: string
  }
}

const TIMEZONE = "Africa/Kampala"

export default function BookingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    try {
      const response = await fetchWithAuth("/api/bookings")
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (bookingId: number) => {
    try {
      const response = await fetchWithAuth(`/api/bookings/${bookingId}/cancel`, {
        method: "PUT",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled.",
      })

      fetchBookings()
    } catch (error: any) {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const zonedDate = toZonedTime(date, TIMEZONE)
    return format(zonedDate, "PPp")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading bookings...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your vehicle bookings</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't made any bookings yet</p>
              <Button onClick={() => router.push("/vehicles")}>Browse Vehicles</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {booking.vehicle.brand} {booking.vehicle.model}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">{booking.vehicle.plate}</p>
                    </div>
                    <Badge
                      variant={
                        booking.status === "COMPLETED"
                          ? "default"
                          : booking.status === "CANCELLED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Booking Period</p>
                      <p className="font-semibold">{formatDateTime(booking.startAt)}</p>
                      <p className="font-semibold">{formatDateTime(booking.endAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purpose & Type</p>
                      <p className="font-semibold">
                        {booking.purpose.replace("_", " ")} - {booking.type}
                      </p>
                    </div>
                    {booking.hiredAt && (
                      <div>
                        <p className="text-sm text-muted-foreground">Hired At</p>
                        <p className="font-semibold">{formatDateTime(booking.hiredAt)}</p>
                      </div>
                    )}
                    {booking.returnedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground">Returned At</p>
                        <p className="font-semibold">{formatDateTime(booking.returnedAt)}</p>
                      </div>
                    )}
                    {booking.totalCost && (
                      <div>
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-xl font-bold text-primary">UGX {booking.totalCost.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  {booking.status === "CONFIRMED" && (
                    <div className="mt-4">
                      <Button variant="destructive" size="sm" onClick={() => handleCancel(booking.id)}>
                        Cancel Booking
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
