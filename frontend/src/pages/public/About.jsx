import { Link } from 'react-router-dom'
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
    const values = [
        {
            icon: Target,
            title: 'Transparency',
            description: 'We believe in open communication between citizens and government.',
        },
        {
            icon: Heart,
            title: 'Community First',
            description: 'Every feature we build is designed with citizens in mind.',
        },
        {
            icon: Users,
            title: 'Collaboration',
            description: 'Working together to create meaningful change in our cities.',
        },
        {
            icon: Lightbulb,
            title: 'Innovation',
            description: 'Using technology to solve real-world civic challenges.',
        },
    ]

    const team = [
        { name: 'CivicReport Team', role: 'Building better communities' },
    ]

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-4">
                            About CivicReport
                        </p>
                        <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tight mb-6">
                            ABOUT{' '}
                            <span className="text-foreground">
                                CIVICREPORT
                            </span>
                        </h1>
                        <div className="border-b-3 border-foreground w-24 mx-auto mb-6" />
                        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                            We're on a mission to bridge the gap between citizens and local governments,
                            making it easier than ever to report and resolve community issues.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 border-t-3 border-b-3 border-foreground">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div>
                            <h2 className="font-display text-3xl uppercase mb-4">Our Mission</h2>
                            <p className="text-muted-foreground mb-4">
                                CivicReport was born from a simple idea: everyone should have an easy way to
                                report infrastructure issues in their community. Whether it's a pothole on
                                your street, a broken streetlight, or damaged public property, we believe
                                that citizens deserve a voice.
                            </p>
                            <p className="text-muted-foreground">
                                We connect everyday people with the government institutions responsible for
                                maintaining our shared spaces, creating a more responsive and accountable
                                system for all.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-3">
                                        <Building2 className="h-5 w-5 text-foreground" />
                                    </div>
                                    <div className="font-display text-2xl uppercase">Direct</div>
                                    <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Institution Connection</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-3">
                                        <Globe className="h-5 w-5 text-foreground" />
                                    </div>
                                    <div className="font-display text-2xl uppercase">Open</div>
                                    <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">For Everyone</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-3">
                                        <Shield className="h-5 w-5 text-foreground" />
                                    </div>
                                    <div className="font-display text-2xl uppercase">Secure</div>
                                    <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Data Protection</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-3">
                                        <Users className="h-5 w-5 text-foreground" />
                                    </div>
                                    <div className="font-display text-2xl uppercase">Community</div>
                                    <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Driven Solution</div>
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
                        <h2 className="font-display text-3xl uppercase mb-4">Our Values</h2>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground max-w-2xl mx-auto">
                            These principles guide everything we do at CivicReport.
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
                        <h2 className="font-display text-3xl uppercase mb-4">Join Our Community</h2>
                        <p className="text-muted-foreground mb-8">
                            Be part of the movement to create better communities. Start reporting
                            issues today and make a real difference.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild>
                                <Link to="/register">
                                    <span className="uppercase">Get Started</span>
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="hover:bg-foreground hover:text-background transition-none">
                                <Link to="/contact"><span className="uppercase">Contact Us</span></Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
