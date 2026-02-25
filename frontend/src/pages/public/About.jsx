import { Link } from 'react-router-dom'
import { useI18n } from '@/context/I18nContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Target,
    Heart,
    Users,
    Lightbulb,
    ArrowRight,
    Building2,
    Globe,
    Shield,
} from 'lucide-react'

export default function About() {
    const { t } = useI18n()

    const values = [
        {
            icon: Target,
            title: t('about.transparency'),
            description: t('about.transparencyDesc'),
        },
        {
            icon: Heart,
            title: t('about.communityFirst'),
            description: t('about.communityFirstDesc'),
        },
        {
            icon: Users,
            title: t('about.collaboration'),
            description: t('about.collaborationDesc'),
        },
        {
            icon: Lightbulb,
            title: t('about.innovation'),
            description: t('about.innovationDesc'),
        },
    ]

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-4">
                            {t('about.aboutCityClarity')}
                        </p>
                        <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tight mb-6">
                            {t('about.headerPrefix')}{' '}
                            <span className="text-foreground">
                                CITYCLARITY
                            </span>
                        </h1>
                        <div className="border-b-3 border-foreground w-24 mx-auto mb-6" />
                        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                            {t('about.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 border-t-3 border-b-3 border-foreground">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div>
                            <h2 className="font-display text-3xl uppercase mb-4">{t('about.ourMission')}</h2>
                            <p className="text-muted-foreground mb-4">
                                {t('about.missionParagraph1')}
                            </p>
                            <p className="text-muted-foreground">
                                {t('about.missionParagraph2')}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-3">
                                        <Building2 className="h-5 w-5 text-foreground" />
                                    </div>
                                    <div className="font-display text-2xl uppercase">{t('about.direct')}</div>
                                    <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t('about.institutionConnection')}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-3">
                                        <Globe className="h-5 w-5 text-foreground" />
                                    </div>
                                    <div className="font-display text-2xl uppercase">{t('about.open')}</div>
                                    <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t('about.forEveryone')}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-3">
                                        <Shield className="h-5 w-5 text-foreground" />
                                    </div>
                                    <div className="font-display text-2xl uppercase">{t('about.secure')}</div>
                                    <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t('about.dataProtection')}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-3">
                                        <Users className="h-5 w-5 text-foreground" />
                                    </div>
                                    <div className="font-display text-2xl uppercase">{t('about.community')}</div>
                                    <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t('about.drivenSolution')}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl uppercase mb-4">{t('about.ourValues')}</h2>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground max-w-2xl mx-auto">
                            {t('about.valuesSubtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {values.map((value, index) => (
                            <Card key={index} className="text-center">
                                <CardContent className="p-6">
                                    <div className="w-14 h-14 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-4">
                                        <value.icon className="h-7 w-7 text-foreground" />
                                    </div>
                                    <h3 className="text-xl font-bold uppercase mb-2">{value.title}</h3>
                                    <p className="text-muted-foreground text-sm">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 border-t-3 border-foreground">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="font-display text-3xl uppercase mb-4">{t('about.joinCommunity')}</h2>
                        <p className="text-muted-foreground mb-8">
                            {t('about.joinCommunityDesc')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild>
                                <Link to="/register">
                                    <span className="uppercase">{t('about.getStarted')}</span>
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="hover:bg-foreground hover:text-background transition-none">
                                <Link to="/contact"><span className="uppercase">{t('about.contactUs')}</span></Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
