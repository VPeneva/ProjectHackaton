import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useReportStats } from '@/hooks/useReports'
import {
    MapPin,
    FileText,
    CheckCircle,
    ArrowRight,
    Zap,
    Shield,
    Users,
    Building2,
    AlertTriangle,
    Clock,
    Send,
    Target,
} from 'lucide-react'

// Hero Section
function Hero() {
    return (
        <section className="relative overflow-hidden py-20 md:py-32">
            {/* Background decorations */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
            </div>

            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge variant="secondary" className="mb-4 px-4 py-1.5">
                        <Zap className="w-3 h-3 mr-1" />
                        Empowering Communities
                    </Badge>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                        Report Issues.{' '}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Transform
                        </span>{' '}
                        Your City.
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Join thousands of citizens making a difference. Report infrastructure problems,
                        track progress in real-time, and watch your community improve.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" asChild className="text-base">
                            <Link to="/register">
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="text-base">
                            <Link to="/reports">
                                <MapPin className="mr-2 h-5 w-5" />
                                Explore Reports
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}

// Features Section
function Features() {
    const features = [
        {
            icon: FileText,
            title: 'Easy Reporting',
            description: 'Submit reports in minutes with our intuitive form. Add photos and pinpoint locations on the map.',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            icon: MapPin,
            title: 'Interactive Map',
            description: 'View all active reports on an interactive map. See what\'s happening in your neighborhood.',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            icon: Clock,
            title: 'Real-time Tracking',
            description: 'Track your report status from submission to resolution. Stay informed every step of the way.',
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
        },
        {
            icon: Building2,
            title: 'Government Connection',
            description: 'Reports are forwarded directly to responsible institutions for quick action.',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            icon: Shield,
            title: 'Transparent Process',
            description: 'Full visibility into the reporting process. Know exactly where your report stands.',
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            icon: Users,
            title: 'Community Driven',
            description: 'Join a community of engaged citizens working together to improve public spaces.',
            color: 'text-teal-500',
            bgColor: 'bg-teal-500/10',
        },
    ]

    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Everything You Need to Make a Difference
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Powerful tools designed to make civic reporting simple, effective, and impactful.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardContent className="p-6">
                                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

// How It Works Section
function HowItWorks() {
    const steps = [
        {
            step: 1,
            icon: AlertTriangle,
            title: 'Spot an Issue',
            description: 'Notice a pothole, broken streetlight, or other infrastructure problem in your area.',
        },
        {
            step: 2,
            icon: FileText,
            title: 'Submit a Report',
            description: 'Create a detailed report with photos and exact location. It takes less than 2 minutes.',
        },
        {
            step: 3,
            icon: Send,
            title: 'We Forward It',
            description: 'Your report is sent to the responsible government institution for action.',
        },
        {
            step: 4,
            icon: Target,
            title: 'Track Progress',
            description: 'Monitor your report status as it moves from pending to resolved.',
        },
    ]

    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Making your voice heard has never been easier. Follow these simple steps to report an issue.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((item, index) => (
                        <div key={index} className="relative text-center">
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
                            )}

                            <div className="relative z-10">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <item.icon className="h-8 w-8" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold shadow-md mx-auto" style={{ left: 'calc(50% + 20px)' }}>
                                    {item.step}
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                            <p className="text-muted-foreground">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Stats Section
function Stats() {
    const { data: stats, isLoading } = useReportStats()

    const statItems = [
        {
            label: 'Reports Submitted',
            value: stats?.total || '500+',
            icon: FileText,
        },
        {
            label: 'Issues Resolved',
            value: stats?.byStatus?.FINISHED || '200+',
            icon: CheckCircle,
        },
        {
            label: 'Active Reports',
            value: (stats?.byStatus?.PENDING || 0) + (stats?.byStatus?.SENT || 0) || '50+',
            icon: Clock,
        },
    ]

    return (
        <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Making Real Impact</h2>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto">
                        Together, we're building better communities. Here's what we've accomplished so far.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {statItems.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                                <stat.icon className="h-8 w-8" />
                            </div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">
                                {isLoading ? '...' : stat.value}
                            </div>
                            <div className="text-lg opacity-90">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// CTA Section
function CTA() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-gradient-to-br from-card to-muted/50 overflow-hidden">
                    <CardContent className="p-8 md:p-12 text-center relative">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <h2 className="text-3xl md:text-4xl font-bold mb-4 relative">
                            Ready to Make a Difference?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto relative">
                            Join CivicReport today and become part of the solution. Your voice matters, and together we can build better communities.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
                            <Button size="lg" asChild className="text-base">
                                <Link to="/register">
                                    Create Free Account
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="text-base">
                                <Link to="/about">Learn More About Us</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}

// Main Landing Page
export default function Landing() {
    return (
        <div className="overflow-hidden">
            <Hero />
            <Features />
            <HowItWorks />
            <Stats />
            <CTA />
        </div>
    )
}
