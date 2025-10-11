"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { Car, Users, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface Vehicle {
  id: number
  brand: string
  model: string | null
  plate: string
  dailyRate: number
  seats: number
  status: string
}

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [purpose, setPurpose] = useState("SELF_DRIVE")
  const [type, setType] = useState("DAILY")

  useEffect(() => {
    fetchVehicle()
  }, [params.id])

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`${API_URL}/api/vehicles/${params.id}`)
      const data = await response.json()
      setVehicle(data)
    } catch (error) {
      console.error("Failed to fetch vehicle:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to book a vehicle",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsBooking(true)

    try {
      const response = await fetchWithAuth("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: vehicle!.id,
          startAt,
          endAt,
          purpose,
          type,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Booking confirmed!",
        description: "Your vehicle has been successfully booked.",
      })

      router.push("/bookings")
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading vehicle details...</p>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Vehicle not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/vehicles">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vehicles
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Vehicle Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl">{vehicle.brand}</CardTitle>
                  {vehicle.model && <p className="text-xl text-muted-foreground mt-1">{vehicle.model}</p>}
                </div>
                <Badge variant={vehicle.status === "AVAILABLE" ? "default" : "secondary"} className="text-sm">
                  {vehicle.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Number Plate</p>
                    <p className="font-mono font-semibold">{vehicle.plate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Seating Capacity</p>
                    <p className="font-semibold">{vehicle.seats} passengers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Rate</p>
                    <p className="text-2xl font-bold text-primary">UGX {vehicle.dailyRate.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Book This Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startAt">Start Date & Time</Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endAt">End Date & Time</Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger id="purpose">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SELF_DRIVE">Self Drive</SelectItem>
                      <SelectItem value="VIP">VIP Service</SelectItem>
                      <SelectItem value="ESCORT">Escort</SelectItem>
                      <SelectItem value="FUNCTION">Function/Event</SelectItem>
                      <SelectItem value="AIRPORT_TRANSFER">Airport Transfer</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Hire Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOURLY">Hourly</SelectItem>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={vehicle.status !== "AVAILABLE" || isBooking}>
                  {isBooking ? "Processing..." : "Confirm Booking"}
                </Button>

                {vehicle.status !== "AVAILABLE" && (
                  <p className="text-sm text-destructive text-center">This vehicle is currently unavailable</p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
