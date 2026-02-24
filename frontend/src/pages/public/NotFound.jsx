import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search, MapPin } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <div className="text-center max-w-lg">
                {/* Decorative background */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                </div>

                {/* 404 Number */}
                <div className="relative mb-8">
                    <div className="text-[150px] md:text-[200px] font-bold text-muted/20 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    Page Not Found
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Oops! Looks like this page went missing. Don't worry, you can find your
                    way back or explore other parts of CityClarity.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" asChild>
                        <Link to="/">
                            <Home className="mr-2 h-5 w-5" />
                            Back to Home
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link to="/reports">
                            <Search className="mr-2 h-5 w-5" />
                            Browse Reports
                        </Link>
                    </Button>
                </div>

                {/* Quick links */}
                <div className="mt-12 pt-8 border-t">
                    <p className="text-sm text-muted-foreground mb-4">Or try these pages:</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link to="/map" className="text-primary hover:underline">
                            Map Explorer
                        </Link>
                        <Link to="/about" className="text-primary hover:underline">
                            About Us
                        </Link>
                        <Link to="/contact" className="text-primary hover:underline">
                            Contact
                        </Link>
                        <Link to="/login" className="text-primary hover:underline">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
