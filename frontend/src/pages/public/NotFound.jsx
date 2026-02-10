import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, Search, MapPin } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <div className="text-center max-w-lg">
                {/* 404 Number */}
                <div className="relative mb-8">
                    <div className="font-display text-[150px] md:text-[200px] text-foreground/10 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 border-3 border-foreground bg-muted flex items-center justify-center">
                            <MapPin className="h-10 w-10 text-foreground" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <h1 className="font-display text-5xl uppercase mb-4">
                    PAGE NOT FOUND
                </h1>
                <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-8">
                    Oops! Looks like this page went missing. Don't worry, you can find your
                    way back or explore other parts of CivicReport.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" asChild>
                        <Link to="/">
                            <Home className="mr-2 h-5 w-5" />
                            <span className="uppercase">Back to Home</span>
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="hover:bg-foreground hover:text-background transition-none">
                        <Link to="/reports">
                            <Search className="mr-2 h-5 w-5" />
                            <span className="uppercase">Browse Reports</span>
                        </Link>
                    </Button>
                </div>

                {/* Quick links */}
                <div className="mt-12 pt-8 border-t-3 border-foreground">
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">Or try these pages:</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link to="/map" className="font-bold uppercase hover:bg-foreground hover:text-background transition-none">
                            Map Explorer
                        </Link>
                        <Link to="/about" className="font-bold uppercase hover:bg-foreground hover:text-background transition-none">
                            About Us
                        </Link>
                        <Link to="/contact" className="font-bold uppercase hover:bg-foreground hover:text-background transition-none">
                            Contact
                        </Link>
                        <Link to="/login" className="font-bold uppercase hover:bg-foreground hover:text-background transition-none">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
