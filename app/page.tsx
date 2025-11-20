import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Car, Shield, Clock, Award } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-3xl z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance leading-tight">
                Premium Car Hire Services in <span className="text-primary">Uganda</span>
              </h1>
              <p className="text-xl mb-8 text-slate-300 text-pretty">
                Experience luxury and comfort with MAM Tours & Travel. Choose from our fleet of premium vehicles
                including Mercedes-Benz, Audi, and BMW.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 border-none">
                  <Link href="/vehicles">Browse Vehicles</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] w-full hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-transparent z-10 rounded-2xl" />
              <Image
                src="/layouttt.png"
                alt="Premium Luxury Vehicle"
                fill
                className="object-cover rounded-2xl shadow-2xl border border-white/10"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose MAM Tours?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-card shadow-sm border hover:border-primary/50 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full text-primary mb-4">
                <Car className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Premium Fleet</h3>
              <p className="text-muted-foreground text-sm">Top-tier vehicles from Mercedes-Benz, Audi, BMW, and more</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card shadow-sm border hover:border-primary/50 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full text-primary mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fully Insured</h3>
              <p className="text-muted-foreground text-sm">All vehicles come with comprehensive insurance coverage</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card shadow-sm border hover:border-primary/50 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full text-primary mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
              <p className="text-muted-foreground text-sm">Round-the-clock customer support for your convenience</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card shadow-sm border hover:border-primary/50 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full text-primary mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Best Rates</h3>
              <p className="text-muted-foreground text-sm">
                Competitive pricing with flexible daily, weekly, and hourly options
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">Ready to Hit the Road?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Book your perfect vehicle today and experience the best car hire service in Uganda
          </p>
          <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90">
            <Link href="/vehicles">View Available Vehicles</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
