"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Users } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface Vehicle {
  id: number
  brand: string
  model: string | null
  plate: string
  dailyRate: number | null
  seats: number
  status: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [brandFilter, setBrandFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, brandFilter, searchQuery])

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/vehicles`)
      const data = await response.json()

      if (Array.isArray(data)) {
        setVehicles(data)
      } else {
        console.error("Expected array of vehicles but got:", data)
        setVehicles([])
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error)
      setVehicles([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterVehicles = () => {
    let filtered = vehicles

    if (brandFilter !== "all") {
      filtered = filtered.filter((v) => v.brand.toLowerCase().includes(brandFilter.toLowerCase()))
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (v) =>
          v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.plate.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredVehicles(filtered)
  }

  const brands = Array.from(new Set(vehicles.map((v) => v.brand)))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading vehicles...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Available Vehicles</h1>
          <p className="text-muted-foreground">Browse our premium fleet and book your perfect ride</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            placeholder="Search by brand, model, or plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-96"
          />
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vehicle Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{vehicle.brand}</CardTitle>
                    {vehicle.model && <p className="text-muted-foreground">{vehicle.model}</p>}
                  </div>
                  <Badge variant={vehicle.status === "AVAILABLE" ? "default" : "secondary"}>{vehicle.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono">{vehicle.plate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{vehicle.seats} seats</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-2xl font-bold text-primary">
                      UGX {vehicle.dailyRate ? Number(vehicle.dailyRate).toLocaleString() : "N/A"}
                      <span className="text-sm font-normal text-muted-foreground">/day</span>
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" disabled={vehicle.status !== "AVAILABLE"}>
                  <Link href={`/vehicles/${vehicle.id}`}>
                    {vehicle.status === "AVAILABLE" ? "Book Now" : "Unavailable"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No vehicles found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
