import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FileText, Shield, ChevronDown, ChevronUp } from 'lucide-react'

export default function Legal() {
    const [expandedSection, setExpandedSection] = useState('terms')

    const sections = [
        {
            id: 'terms',
            title: 'Terms of Service',
            icon: FileText,
            content: [
                {
                    heading: '1. Acceptance of Terms',
                    text: 'By accessing and using CivicReport, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.',
                },
                {
                    heading: '2. Use of Service',
                    text: 'CivicReport is a platform for citizens to report infrastructure issues to local authorities. You agree to use this service only for its intended purpose and to provide accurate information in your reports.',
                },
                {
                    heading: '3. User Accounts',
                    text: 'To submit reports, you must create an account with accurate information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.',
                },
                {
                    heading: '4. Report Submission',
                    text: 'When submitting reports, you agree to provide accurate location information and descriptions. False or misleading reports may result in account suspension. You grant us permission to share your reports with relevant government institutions.',
                },
                {
                    heading: '5. Prohibited Activities',
                    text: 'You may not use CivicReport for spam, harassment, or any illegal activities. Submitting false reports, impersonating others, or attempting to disrupt the service is strictly prohibited.',
                },
                {
                    heading: '6. Intellectual Property',
                    text: 'All content and materials on CivicReport are protected by intellectual property rights. Photos you upload remain your property, but you grant us a license to use them for operating and improving the service.',
                },
                {
                    heading: '7. Limitation of Liability',
                    text: 'CivicReport is provided "as is" without warranties. We are not responsible for actions taken or not taken by government institutions in response to reports.',
                },
                {
                    heading: '8. Changes to Terms',
                    text: 'We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.',
                },
            ],
        },
        {
            id: 'privacy',
            title: 'Privacy Policy',
            icon: Shield,
            content: [
                {
                    heading: '1. Information We Collect',
                    text: 'We collect information you provide directly: name, email address, and report details including photos and location data. We also collect usage data such as pages visited and features used.',
                },
                {
                    heading: '2. How We Use Your Information',
                    text: 'Your information is used to: operate and improve the service, process and forward reports to institutions, communicate with you about your reports, and ensure security and prevent fraud.',
                },
                {
                    heading: '3. Information Sharing',
                    text: 'We share your report information with relevant government institutions to address the reported issues. We may also share information as required by law or to protect rights and safety.',
                },
                {
                    heading: '4. Data Security',
                    text: 'We implement appropriate security measures to protect your information. However, no method of transmission over the internet is 100% secure.',
                },
                {
                    heading: '5. Your Rights',
                    text: 'You have the right to access, correct, or delete your personal information. You may also request a copy of your data or opt out of certain communications.',
                },
                {
                    heading: '6. Location Data',
                    text: 'When you submit a report with location, this data is used to identify the relevant jurisdiction and institution. Location data is shared with authorities handling your report.',
                },
                {
                    heading: '7. Cookies',
                    text: 'We use cookies and similar technologies to improve user experience, remember preferences, and analyze service usage.',
                },
                {
                    heading: '8. Contact Us',
                    text: 'For privacy-related questions or concerns, please contact us through our contact page or email us at privacy@civicreport.com.',
                },
            ],
        },
    ]

    return (
        <div className="min-h-screen py-12">
            {/* Hero Section */}
            <section className="relative py-12 md:py-16 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Legal Information
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Important information about your rights and our policies.
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
                                className="flex-1"
                            >
                                <section.icon className="mr-2 h-4 w-4" />
                                {section.title}
                            </Button>
                        ))}
                    </div>

                    {/* Section Content */}
                    {sections.map((section) => (
                        <Card
                            key={section.id}
                            className={`border-0 shadow-xl transition-all duration-300 ${expandedSection === section.id ? 'block' : 'hidden'
                                }`}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <section.icon className="h-5 w-5 text-primary" />
                                    {section.title}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Last updated: January 2026
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {section.content.map((item, index) => (
                                    <div key={index}>
                                        <h3 className="text-lg font-semibold mb-2">{item.heading}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                                        {index < section.content.length - 1 && (
                                            <Separator className="mt-6" />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Additional Info */}
                    <div className="mt-8 p-6 rounded-lg bg-muted/50 text-center">
                        <p className="text-muted-foreground">
                            If you have any questions about these policies, please{' '}
                            <a href="/contact" className="text-primary hover:underline">
                                contact us
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
