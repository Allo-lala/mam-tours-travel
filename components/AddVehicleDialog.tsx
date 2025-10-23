"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { Plus } from "lucide-react"

interface AddVehicleDialogProps {
  onSuccess: () => void
}

export default function AddVehicleDialog({ onSuccess }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    plate: "",
    dailyRate: "",
    seats: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetchWithAuth("/api/vehicles", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          dailyRate: Number.parseFloat(formData.dailyRate),
          seats: Number.parseInt(formData.seats),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Vehicle added",
        description: "The vehicle has been successfully added to Mam Tours and Travel.",
      })

      setFormData({ brand: "", model: "", plate: "", dailyRate: "", seats: "" })
      setOpen(false)
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Failed to add vehicle",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Add a new vehicle to the fleet. Ugandan number plates only (e.g., UAA 001A or UG 32 00042).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Mercedes-Benz"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="E350"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plate">Number Plate</Label>
            <Input
              id="plate"
              value={formData.plate}
              onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
              placeholder="UAA 001A"
              required
            />
            <p className="text-xs text-muted-foreground">Format: UAA 001A (legacy) or UG 32 00042 (digital)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dailyRate">Daily Rate (UGX)</Label>
            <Input
              id="dailyRate"
              type="number"
              value={formData.dailyRate}
              onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
              placeholder="200000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seats">Seats</Label>
            <Input
              id="seats"
              type="number"
              value={formData.seats}
              onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
              placeholder="5"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Vehicle"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
