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
        <section className="relative border-b-4 border-foreground">
            <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
                <div className="max-w-6xl">
                    {/* Massive stacked typography */}
                    <h1 className="font-display leading-[0.85]">
                        <span className="block text-7xl md:text-[140px] lg:text-[180px] text-foreground">
                            REPORT.
                        </span>
                        <span className="block text-7xl md:text-[140px] lg:text-[180px] text-primary">
                            TRANSFORM.
                        </span>
                        <span
                            className="block text-7xl md:text-[140px] lg:text-[180px] text-transparent"
                            style={{
                                WebkitTextStroke: '2px hsl(var(--foreground))',
                            }}
                        >
                            IMPROVE.
                        </span>
                    </h1>

                    {/* System status line */}
                    <div className="mt-8 mb-4">
                        <span className="font-mono text-sm md:text-base text-primary tracking-widest">
                            [SYSTEM ACTIVE &mdash; ACCEPTING REPORTS]
                        </span>
                    </div>

                    {/* Redacted decorative text */}
                    <p className="font-mono text-muted-foreground/30 line-through text-sm mb-10 select-none">
                        Nobody cares.
                    </p>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <Button size="lg" asChild className="text-base font-mono uppercase tracking-wider">
                            <Link to="/register">
                                REPORT NOW &gt;&gt;&gt;
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="text-base font-mono uppercase tracking-wider border-2">
                            <Link to="/reports">
                                <MapPin className="mr-2 h-5 w-5" />
                                EXPLORE REPORTS
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Marquee ticker bar */}
            <div className="bg-foreground overflow-hidden py-3 border-t-4 border-foreground">
                <div className="marquee-track">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <span key={i} className="flex items-center shrink-0">
                            <span className="font-display text-accent text-xl md:text-2xl tracking-widest whitespace-nowrap px-6">
                                YOUR CITY NEEDS YOU
                            </span>
                            <span className="w-4 h-4 bg-primary shrink-0" />
                        </span>
                    ))}
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
        },
        {
            icon: MapPin,
            title: 'Interactive Map',
            description: "View all active reports on an interactive map. See what's happening in your neighborhood.",
        },
        {
            icon: Clock,
            title: 'Real-time Tracking',
            description: 'Track your report status from submission to resolution. Stay informed every step of the way.',
        },
        {
            icon: Building2,
            title: 'Government Connection',
            description: 'Reports are forwarded directly to responsible institutions for quick action.',
        },
        {
            icon: Shield,
            title: 'Transparent Process',
            description: 'Full visibility into the reporting process. Know exactly where your report stands.',
        },
        {
            icon: Users,
            title: 'Community Driven',
            description: 'Join a community of engaged citizens working together to improve public spaces.',
        },
    ]

    return (
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                {/* Section title */}
                <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase mb-16 border-b-4 border-foreground pb-6">
                    CAPABILITIES
                </h2>

                {/* Grid with thick shared borders */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t-[3px] border-l-[3px] border-foreground">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group border-b-[3px] border-r-[3px] border-foreground p-6 md:p-8 transition-none hover:bg-foreground hover:text-background cursor-default"
                        >
                            {/* Number tag */}
                            <span className="font-mono text-sm text-primary group-hover:text-primary font-bold tracking-wider">
                                [{String(index + 1).padStart(2, '0')}]
                            </span>

                            {/* Icon */}
                            <div className="mt-4 mb-4">
                                <feature.icon className="h-8 w-8" strokeWidth={2.5} />
                            </div>

                            {/* Title */}
                            <h3 className="font-display text-2xl md:text-3xl uppercase mb-3">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm md:text-base leading-relaxed opacity-80">
                                {feature.description}
                            </p>
                        </div>
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
        <section className="py-20 md:py-28 bg-muted/30 border-y-4 border-foreground">
            <div className="container mx-auto px-4">
                {/* Section title */}
                <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase mb-16">
                    HOW IT WORKS
                </h2>

                <div className="relative">
                    {/* Connector line (desktop only) */}
                    <div className="hidden lg:block absolute top-[55px] left-[calc(12.5%+2px)] right-[calc(12.5%+2px)] h-[3px] bg-foreground z-0" />

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                        {steps.map((item, index) => (
                            <div key={index} className="text-center relative z-10">
                                {/* Step number in bordered square */}
                                <div className="w-28 h-28 border-[3px] border-foreground bg-background flex items-center justify-center mx-auto mb-6">
                                    <span className="font-display text-[80px] leading-none text-foreground">
                                        {item.step}
                                    </span>
                                </div>

                                {/* Monospace step label */}
                                <span className="font-mono text-xs md:text-sm text-primary font-bold tracking-widest">
                                    [STEP {String(item.step).padStart(2, '0')}]
                                </span>

                                {/* Title */}
                                <h3 className="font-display text-2xl md:text-3xl uppercase mt-3 mb-2">
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground leading-relaxed max-w-[250px] mx-auto">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
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
            mono: 'TOTAL_REPORTS',
        },
        {
            label: 'Issues Resolved',
            value: stats?.byStatus?.FINISHED || '200+',
            icon: CheckCircle,
            mono: 'STATUS_RESOLVED',
        },
        {
            label: 'Active Reports',
            value: (stats?.byStatus?.PENDING || 0) + (stats?.byStatus?.SENT || 0) || '50+',
            icon: Clock,
            mono: 'STATUS_ACTIVE',
        },
    ]

    return (
        <section className="bg-foreground text-background py-20 md:py-28">
            <div className="container mx-auto px-4">
                <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase mb-16 text-background">
                    IMPACT IN NUMBERS
                </h2>

                <div className="flex flex-col md:flex-row items-center justify-center max-w-5xl mx-auto">
                    {statItems.map((stat, index) => (
                        <div key={index} className="flex items-center">
                            <div className="text-center px-8 md:px-12 py-6">
                                {/* Monospace sub-label */}
                                <span className="font-mono text-xs tracking-widest text-background/50 block mb-2">
                                    {stat.mono}
                                </span>

                                {/* Huge number */}
                                <div className="font-display text-6xl md:text-7xl lg:text-8xl text-background leading-none mb-3">
                                    {isLoading ? '...' : stat.value}
                                </div>

                                {/* Label */}
                                <span className="font-mono text-sm tracking-wider text-background/70 uppercase">
                                    {stat.label}
                                </span>
                            </div>

                            {/* Vertical divider (not after last item) */}
                            {index < statItems.length - 1 && (
                                <div className="hidden md:block w-[3px] h-32 bg-background shrink-0" />
                            )}

                            {/* Horizontal divider on mobile */}
                            {index < statItems.length - 1 && (
                                <div className="block md:hidden w-32 h-[3px] bg-background shrink-0" />
                            )}
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
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <Card className="max-w-4xl mx-auto border-[3px] border-foreground shadow-brutal bg-background overflow-hidden">
                    <CardContent className="p-8 md:p-12 lg:p-16 text-center relative">
                        {/* URGENT stamp */}
                        <div className="absolute top-6 right-6 md:top-8 md:right-8">
                            <span className="inline-block font-display text-3xl md:text-4xl text-primary border-[3px] border-primary px-4 py-1 rotate-12 select-none">
                                URGENT
                            </span>
                        </div>

                        {/* Headline */}
                        <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase mb-6 leading-[0.9] pt-8">
                            DO SOMETHING
                            <br />
                            ABOUT IT
                        </h2>

                        <p className="font-mono text-sm md:text-base text-muted-foreground mb-10 max-w-xl mx-auto">
                            Your voice matters. Join CityClarity today and become part of the solution. Together we build better communities.
                        </p>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" asChild className="text-base font-mono uppercase tracking-wider">
                                <Link to="/register">
                                    REPORT NOW &gt;&gt;&gt;
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="text-base font-mono uppercase tracking-wider border-2">
                                <Link to="/about">
                                    LEARN MORE
                                </Link>
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
