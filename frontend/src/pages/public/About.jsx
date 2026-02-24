import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
        { name: 'CityClarity Team', role: 'Building better communities' },
    ]

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                            About{' '}
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                CityClarity
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground">
                            We're on a mission to bridge the gap between citizens and local governments,
                            making it easier than ever to report and resolve community issues.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                            <p className="text-muted-foreground mb-4">
                                CityClarity was born from a simple idea: everyone should have an easy way to
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
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6 text-center">
                                    <Building2 className="h-10 w-10 text-primary mx-auto mb-3" />
                                    <div className="text-2xl font-bold">Direct</div>
                                    <div className="text-sm text-muted-foreground">Institution Connection</div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6 text-center">
                                    <Globe className="h-10 w-10 text-accent mx-auto mb-3" />
                                    <div className="text-2xl font-bold">Open</div>
                                    <div className="text-sm text-muted-foreground">For Everyone</div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6 text-center">
                                    <Shield className="h-10 w-10 text-green-500 mx-auto mb-3" />
                                    <div className="text-2xl font-bold">Secure</div>
                                    <div className="text-sm text-muted-foreground">Data Protection</div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6 text-center">
                                    <Users className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                                    <div className="text-2xl font-bold">Community</div>
                                    <div className="text-sm text-muted-foreground">Driven Solution</div>
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
                        <h2 className="text-3xl font-bold mb-4">Our Values</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            These principles guide everything we do at CityClarity.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {values.map((value, index) => (
                            <Card key={index} className="border-0 shadow-lg text-center">
                                <CardContent className="p-6">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <value.icon className="h-7 w-7 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                                    <p className="text-muted-foreground text-sm">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <Separator />

            {/* CTA Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                        <p className="text-muted-foreground mb-8">
                            Be part of the movement to create better communities. Start reporting
                            issues today and make a real difference.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild>
                                <Link to="/register">
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link to="/contact">Contact Us</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
