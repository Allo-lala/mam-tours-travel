"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Car } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Car className="h-6 w-6 text-primary" />
            <span>MAM Tours</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/vehicles"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/vehicles" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Vehicles
            </Link>

            {user ? (
              <>
                <Link
                  href="/bookings"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/bookings" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  My Bookings
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname === "/admin" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <Button onClick={logout} variant="outline" size="sm">
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
          </div>
        </div>
      </div>
    </nav>
  )
}
