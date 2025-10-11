"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import AddVehicleDialog from "@/components/AddVehicleDialog"

const TIMEZONE = "Africa/Kampala"

interface Booking {
  id: number
  startAt: string
  endAt: string
  hiredAt: string | null
  returnedAt: string | null
  status: string
  totalCost: number | null
  vehicle: {
    brand: string
    model: string | null
    plate: string
  }
  user: {
    name: string | null
    email: string
  }
}

export default function AdminPage() {
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
    if (user.role !== "ADMIN") {
      router.push("/vehicles")
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

  const handleMarkHired = async (bookingId: number) => {
    try {
      const response = await fetchWithAuth(`/api/bookings/${bookingId}/mark-hired`, {
        method: "PUT",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Booking updated",
        description: "Vehicle marked as hired.",
      })

      fetchBookings()
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleMarkReturned = async (bookingId: number) => {
    try {
      const response = await fetchWithAuth(`/api/bookings/${bookingId}/mark-returned`, {
        method: "PUT",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Booking completed",
        description: "Vehicle marked as returned.",
      })

      fetchBookings()
    } catch (error: any) {
      toast({
        title: "Update failed",
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

  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED")
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage bookings and vehicles</p>
          </div>
          <AddVehicleDialog onSuccess={fetchBookings} />
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Bookings ({confirmedBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {confirmedBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No active bookings</p>
                </CardContent>
              </Card>
            ) : (
              confirmedBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>
                          {booking.vehicle.brand} {booking.vehicle.model}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-mono">{booking.vehicle.plate}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Customer: {booking.user.name || booking.user.email}
                        </p>
                      </div>
                      <Badge variant="secondary">{booking.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Booking Period</p>
                        <p className="font-semibold">{formatDateTime(booking.startAt)}</p>
                        <p className="font-semibold">{formatDateTime(booking.endAt)}</p>
                      </div>
                      {booking.hiredAt && (
                        <div>
                          <p className="text-sm text-muted-foreground">Hired At</p>
                          <p className="font-semibold">{formatDateTime(booking.hiredAt)}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!booking.hiredAt && (
                        <Button size="sm" onClick={() => handleMarkHired(booking.id)}>
                          Mark as Hired
                        </Button>
                      )}
                      {booking.hiredAt && !booking.returnedAt && (
                        <Button size="sm" onClick={() => handleMarkReturned(booking.id)}>
                          Mark as Returned
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No completed bookings</p>
                </CardContent>
              </Card>
            ) : (
              completedBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>
                          {booking.vehicle.brand} {booking.vehicle.model}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-mono">{booking.vehicle.plate}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Customer: {booking.user.name || booking.user.email}
                        </p>
                      </div>
                      <Badge>{booking.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Hired At</p>
                        <p className="font-semibold">{booking.hiredAt && formatDateTime(booking.hiredAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Returned At</p>
                        <p className="font-semibold">{booking.returnedAt && formatDateTime(booking.returnedAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-xl font-bold text-primary">UGX {booking.totalCost?.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
