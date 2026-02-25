import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useReportStats } from '@/hooks/useReports'
import { useI18n } from '@/context/I18nContext'
import {
    MapPin,
    FileText,
    CheckCircle,
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
    const { t, language } = useI18n()
    const isBg = language === 'bg'
    // Bulgarian words are ~2x longer than English, scale down to fit the container
    const heroSize = isBg
        ? 'block text-[48px] sm:text-[65px] md:text-[88px] lg:text-[118px] xl:text-[132px]'
        : 'block text-7xl md:text-[140px] lg:text-[180px]'

    return (
        <section className="relative border-b-4 border-foreground">
            <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
                <div className="max-w-6xl">
                    <h1 className="font-display leading-[0.85]">
                        <span className={`${heroSize} text-foreground`}>
                            {t('landing.report')}
                        </span>
                        <span className={`${heroSize} text-primary`}>
                            {t('landing.transform')}
                        </span>
                        <span
                            className={`${heroSize} text-transparent`}
                            style={{
                                WebkitTextStroke: '2px hsl(var(--foreground))',
                            }}
                        >
                            {t('landing.improve')}
                        </span>
                    </h1>

                    {/* System status line */}
                    <div className="mt-8 mb-4">
                        <span className="font-mono text-sm md:text-base text-primary tracking-widest">
                            {t('landing.systemActive')}
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
                                {t('landing.reportNow')}
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="text-base font-mono uppercase tracking-wider border-2">
                            <Link to="/reports">
                                <MapPin className="mr-2 h-5 w-5" />
                                {t('landing.exploreReports')}
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
                                {t('landing.cityNeedsYou')}
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
    const { t } = useI18n()
    const features = [
        {
            icon: FileText,
            title: t('landing.featureEasyReporting'),
            description: t('landing.featureEasyReportingDesc'),
        },
        {
            icon: MapPin,
            title: t('landing.featureInteractiveMap'),
            description: t('landing.featureInteractiveMapDesc'),
        },
        {
            icon: Clock,
            title: t('landing.featureRealTimeTracking'),
            description: t('landing.featureRealTimeTrackingDesc'),
        },
        {
            icon: Building2,
            title: t('landing.featureGovConnection'),
            description: t('landing.featureGovConnectionDesc'),
        },
        {
            icon: Shield,
            title: t('landing.featureTransparentProcess'),
            description: t('landing.featureTransparentProcessDesc'),
        },
        {
            icon: Users,
            title: t('landing.featureCommunityDriven'),
            description: t('landing.featureCommunityDrivenDesc'),
        },
    ]

    return (
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                {/* Section title */}
                <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase mb-16 border-b-4 border-foreground pb-6">
                    {t('landing.capabilities')}
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
                            <h3 className="font-display text-xl md:text-2xl uppercase mb-3 leading-tight">
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
    const { t } = useI18n()
    const steps = [
        {
            step: 1,
            icon: AlertTriangle,
            title: t('landing.stepSpotIssue'),
            description: t('landing.stepSpotIssueDesc'),
        },
        {
            step: 2,
            icon: FileText,
            title: t('landing.stepSubmitReport'),
            description: t('landing.stepSubmitReportDesc'),
        },
        {
            step: 3,
            icon: Send,
            title: t('landing.stepWeForward'),
            description: t('landing.stepWeForwardDesc'),
        },
        {
            step: 4,
            icon: Target,
            title: t('landing.stepTrackProgress'),
            description: t('landing.stepTrackProgressDesc'),
        },
    ]

    return (
        <section className="py-20 md:py-28 bg-muted/30 border-y-4 border-foreground">
            <div className="container mx-auto px-4">
                {/* Section title */}
                <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase mb-16">
                    {t('landing.howItWorks')}
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
                                    [{t('landing.step')} {String(item.step).padStart(2, '0')}]
                                </span>

                                {/* Title */}
                                <h3 className="font-display text-xl md:text-2xl uppercase mt-3 mb-2 leading-tight">
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
    const { t } = useI18n()
    const { data: stats, isLoading } = useReportStats()

    const statItems = [
        {
            label: t('landing.reportsSubmitted'),
            value: stats?.total || '500+',
            mono: 'TOTAL_REPORTS',
        },
        {
            label: t('landing.issuesResolved'),
            value: stats?.byStatus?.FINISHED || '200+',
            mono: 'STATUS_RESOLVED',
        },
        {
            label: t('landing.activeReports'),
            value: (stats?.byStatus?.PENDING || 0) + (stats?.byStatus?.SENT || 0) || '50+',
            mono: 'STATUS_ACTIVE',
        },
    ]

    return (
        <section className="bg-foreground text-background py-20 md:py-28">
            <div className="container mx-auto px-4">
                <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase mb-16 text-background">
                    {t('landing.impactInNumbers')}
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
    const { t } = useI18n()
    return (
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <Card className="max-w-4xl mx-auto border-[3px] border-foreground shadow-brutal bg-background overflow-hidden">
                    <CardContent className="p-8 md:p-12 lg:p-16 text-center relative">
                        {/* URGENT stamp */}
                        <div className="absolute top-6 right-6 md:top-8 md:right-8">
                            <span className="inline-block font-display text-2xl md:text-4xl text-primary border-[3px] border-primary px-3 py-1 rotate-12 select-none">
                                {t('landing.urgent')}
                            </span>
                        </div>

                        {/* Headline — whitespace-pre-wrap preserves the \n in translations */}
                        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase mb-6 leading-[0.9] pt-8 whitespace-pre-wrap">
                            {t('landing.doSomethingAboutIt')}
                        </h2>

                        <p className="font-mono text-sm md:text-base text-muted-foreground mb-10 max-w-xl mx-auto">
                            {t('landing.ctaDescription')}
                        </p>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" asChild className="text-base font-mono uppercase tracking-wider">
                                <Link to="/register">
                                    {t('landing.reportNow')}
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="text-base font-mono uppercase tracking-wider border-2">
                                <Link to="/about">
                                    {t('landing.learnMore')}
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
