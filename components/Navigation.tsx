"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, Shield, Car, Menu } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useState } from "react"

export function Navigation() {
  const pathname = usePathname()
  const { user, logout, isMounted } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  console.log("[v0] Navigation - User:", user)
  console.log("[v0] Navigation - User Role:", user?.role)

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* <Link
        href="/vehicles"
        onClick={() => mobile && setIsOpen(false)}
        className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
          pathname === "/vehicles" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Car className="h-4 w-4" />
        Vehicles
      </Link> */}

      {isMounted && (
        <>
          {user ? (
            <>
              <Link
                href="/bookings"
                onClick={() => mobile && setIsOpen(false)}
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
                  onClick={() => mobile && setIsOpen(false)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/admin" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}
              <Button
                onClick={() => {
                  logout()
                  mobile && setIsOpen(false)
                }}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" onClick={() => mobile && setIsOpen(false)}>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm" onClick={() => mobile && setIsOpen(false)}>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </>
      )}
    </>
  )

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-14 w-14">
              <Image src="/logoo.png" alt="MAM Tours Logo" fill className="object-contain" />
            </div>
            {/* <span className="font-bold text-2xl text-primary">MAM Tours</span> */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavItems />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="text-left mb-4">Menu</SheetTitle>
                <div className="flex flex-col gap-4 mt-4">
                  <NavItems mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
