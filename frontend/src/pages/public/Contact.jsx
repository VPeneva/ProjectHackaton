import { useState } from 'react'
import { contactService } from '@/services/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
    Mail,
    Phone,
    MapPin,
    Send,
    Loader2,
    CheckCircle,
    AlertCircle,
} from 'lucide-react'

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await contactService.submit(formData)
            setSuccess(true)
            setFormData({ name: '', email: '', message: '' })
            toast.success('Message sent successfully!')
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to send message. Please try again.'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email',
            value: 'contact@civicreport.com',
            href: 'mailto:contact@civicreport.com',
        },
        {
            icon: Phone,
            title: 'Phone',
            value: '+1 (555) 123-4567',
            href: 'tel:+15551234567',
        },
        {
            icon: MapPin,
            title: 'Address',
            value: 'City Hall, Main Street',
            href: null,
        },
    ]

    return (
        <div className="min-h-screen py-12">
            {/* Hero Section */}
            <section className="relative py-12 md:py-20 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Get in Touch
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Have questions or feedback? We'd love to hear from you. Send us a message
                            and we'll respond as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Contact Information</h2>
                        <p className="text-muted-foreground">
                            Reach out through any of these channels and we'll get back to you promptly.
                        </p>

                        <div className="space-y-4">
                            {contactInfo.map((item, index) => (
                                <Card key={index} className="border-0 shadow-md">
                                    <CardContent className="p-4 flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <item.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">{item.title}</div>
                                            {item.href ? (
                                                <a
                                                    href={item.href}
                                                    className="font-medium hover:text-primary transition-colors"
                                                >
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <div className="font-medium">{item.value}</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-2">
                        <Card className="border-0 shadow-xl">
                            <CardHeader>
                                <CardTitle>Send a Message</CardTitle>
                                <CardDescription>
                                    Fill out the form below and we'll get back to you within 24 hours.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {success ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Thank you for reaching out. We'll respond to your message as soon as possible.
                                        </p>
                                        <Button variant="outline" onClick={() => setSuccess(false)}>
                                            Send Another Message
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {error && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{error}</AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    placeholder="Your name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message</Label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                placeholder="How can we help you?"
                                                rows={6}
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    )
}
