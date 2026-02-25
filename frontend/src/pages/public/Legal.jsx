import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Shield } from 'lucide-react'
import { useI18n } from '@/context/I18nContext'

export default function Legal() {
    const [expandedSection, setExpandedSection] = useState('terms')
    const { t } = useI18n()

    const sections = [
        {
            id: 'terms',
            title: t('legal.termsOfService'),
            icon: FileText,
            content: [
                { heading: t('legal.terms1Heading'), text: t('legal.terms1Text') },
                { heading: t('legal.terms2Heading'), text: t('legal.terms2Text') },
                { heading: t('legal.terms3Heading'), text: t('legal.terms3Text') },
                { heading: t('legal.terms4Heading'), text: t('legal.terms4Text') },
                { heading: t('legal.terms5Heading'), text: t('legal.terms5Text') },
                { heading: t('legal.terms6Heading'), text: t('legal.terms6Text') },
                { heading: t('legal.terms7Heading'), text: t('legal.terms7Text') },
                { heading: t('legal.terms8Heading'), text: t('legal.terms8Text') },
            ],
        },
        {
            id: 'privacy',
            title: t('legal.privacyPolicy'),
            icon: Shield,
            content: [
                { heading: t('legal.privacy1Heading'), text: t('legal.privacy1Text') },
                { heading: t('legal.privacy2Heading'), text: t('legal.privacy2Text') },
                { heading: t('legal.privacy3Heading'), text: t('legal.privacy3Text') },
                { heading: t('legal.privacy4Heading'), text: t('legal.privacy4Text') },
                { heading: t('legal.privacy5Heading'), text: t('legal.privacy5Text') },
                { heading: t('legal.privacy6Heading'), text: t('legal.privacy6Text') },
                { heading: t('legal.privacy7Heading'), text: t('legal.privacy7Text') },
                { heading: t('legal.privacy8Heading'), text: t('legal.privacy8Text') },
            ],
        },
    ]

    return (
        <div className="min-h-screen py-12">
            {/* Hero Section */}
            <section className="relative py-12 md:py-16 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tight mb-4">
                            {t('legal.title')}
                        </h1>
                        <div className="border-b-3 border-foreground w-24 mx-auto mb-4" />
                        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                            {t('legal.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Legal Content */}
            <section className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Section Tabs */}
                    <div className="flex gap-4 mb-8">
                        {sections.map((section) => (
                            <Button
                                key={section.id}
                                variant={expandedSection === section.id ? 'default' : 'outline'}
                                onClick={() => setExpandedSection(section.id)}
                                className={`flex-1 transition-none ${
                                    expandedSection === section.id
                                        ? 'bg-foreground text-background'
                                        : 'hover:bg-foreground hover:text-background'
                                }`}
                            >
                                <section.icon className="mr-2 h-4 w-4" />
                                <span className="uppercase">{section.title}</span>
                            </Button>
                        ))}
                    </div>

                    {/* Section Content */}
                    {sections.map((section) => (
                        <Card
                            key={section.id}
                            className={expandedSection === section.id ? 'block' : 'hidden'}
                        >
                            <CardHeader className="border-b-3 border-foreground">
                                <CardTitle className="flex items-center gap-2 font-display text-xl uppercase">
                                    <section.icon className="h-5 w-5 text-foreground" />
                                    {section.title}
                                </CardTitle>
                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                                    {t('legal.lastUpdated')}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {section.content.map((item, index) => (
                                    <div key={index}>
                                        <h3 className="text-lg font-bold uppercase mb-2">{item.heading}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                                        {index < section.content.length - 1 && (
                                            <div className="border-b-3 border-foreground mt-6" />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Additional Info */}
                    <div className="mt-8 border-3 border-foreground p-6 text-center">
                        <p className="text-muted-foreground">
                            {t('legal.questionsAboutPolicies')}{' '}
                            <a href="/contact" className="font-bold uppercase hover:bg-foreground hover:text-background transition-none">
                                {t('legal.contactUsLink')}
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
