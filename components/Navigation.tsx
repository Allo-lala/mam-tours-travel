"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, Shield, Car } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function Navigation() {
  const pathname = usePathname()
  const { user, logout, isMounted } = useAuth()

  console.log("[ Navigation - User:", user)
  console.log("[ Navigation - User Role:", user?.role)

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image src="/logoo.png" alt="MAM Tours Logo" fill className="object-contain" />
            </div>
            <span className="font-bold text-xl">Tours & Travel</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/vehicles"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/vehicles" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Car className="h-4 w-4" />
              Vehicles
            </Link>

            {isMounted && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/bookings"
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/bookings" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <User className="h-4 w-4" />
                      My Bookings
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                          pathname === "/admin" ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Button onClick={logout} variant="destructive" size="sm" className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/register">Sign Up</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
