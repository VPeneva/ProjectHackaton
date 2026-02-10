import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCreateConversation } from '@/hooks/useConversations'
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
    MessageSquare,
    LogIn,
} from 'lucide-react'

export default function Contact() {
    const { user, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const createConversation = useCreateConversation()

    const [formData, setFormData] = useState({
        subject: '',
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
            if (isAuthenticated) {
                // Create a conversation for logged-in users
                await createConversation.mutateAsync({
                    subject: formData.subject,
                    message: formData.message,
                })
                setSuccess(true)
                setFormData({ subject: '', name: '', email: '', message: '' })
            } else {
                // Fall back to contact message for guests
                await contactService.submit({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                })
                setSuccess(true)
                setFormData({ subject: '', name: '', email: '', message: '' })
                toast.success('Message sent successfully!')
            }
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
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center mb-12">
                        <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tight mb-4">
                            GET IN TOUCH
                        </h1>
                        <div className="border-b-3 border-foreground w-24 mx-auto mb-4" />
                        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
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
                        <h2 className="font-display text-2xl uppercase">Contact Information</h2>
                        <p className="text-muted-foreground">
                            Reach out through any of these channels and we'll get back to you promptly.
                        </p>

                        <div className="space-y-4">
                            {contactInfo.map((item, index) => (
                                <Card key={index}>
                                    <CardContent className="p-4 flex items-center space-x-4">
                                        <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center shrink-0">
                                            <item.icon className="h-5 w-5 text-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{item.title}</div>
                                            {item.href ? (
                                                <a
                                                    href={item.href}
                                                    className="font-medium hover:bg-foreground hover:text-background transition-none"
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

                        {/* Sign in prompt for guests */}
                        {!isAuthenticated && (
                            <Card className="border-3 border-foreground">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 border-3 border-foreground bg-muted flex items-center justify-center shrink-0">
                                            <MessageSquare className="h-5 w-5 text-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold uppercase mb-1">Want live chat support?</h3>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Sign in to chat directly with our support team and track your conversations.
                                            </p>
                                            <Button size="sm" asChild>
                                                <Link to="/login">
                                                    <LogIn className="h-4 w-4 mr-2" />
                                                    <span className="uppercase">Sign In</span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader className="border-b-3 border-foreground">
                                <CardTitle className="font-display text-xl uppercase">
                                    {isAuthenticated ? 'Start a Conversation' : 'Send a Message'}
                                </CardTitle>
                                <CardDescription>
                                    {isAuthenticated
                                        ? 'Start a conversation with our support team. You can track and continue the conversation from your messages.'
                                        : 'Fill out the form below and we\'ll get back to you within 24 hours.'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {success ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="h-8 w-8 text-foreground" />
                                        </div>
                                        <h3 className="font-display text-xl uppercase mb-2">MESSAGE SENT!</h3>
                                        <p className="text-muted-foreground mb-6">
                                            {isAuthenticated
                                                ? 'Your conversation has been started. You can continue the conversation from your messages.'
                                                : 'Thank you for reaching out. We\'ll respond to your message as soon as possible.'
                                            }
                                        </p>
                                        {isAuthenticated ? (
                                            <div className="flex gap-3 justify-center">
                                                <Button variant="outline" onClick={() => setSuccess(false)} className="hover:bg-foreground hover:text-background transition-none">
                                                    <span className="uppercase">Send Another</span>
                                                </Button>
                                                <Button onClick={() => navigate('/messages')}>
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    <span className="uppercase">View Messages</span>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button variant="outline" onClick={() => setSuccess(false)} className="hover:bg-foreground hover:text-background transition-none">
                                                <span className="uppercase">Send Another Message</span>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {error && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{error}</AlertDescription>
                                            </Alert>
                                        )}

                                        {isAuthenticated ? (
                                            // Logged-in user form
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="subject" className="font-mono text-xs uppercase tracking-wider">Subject</Label>
                                                    <Input
                                                        id="subject"
                                                        name="subject"
                                                        placeholder="What is this about?"
                                                        value={formData.subject}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="message" className="font-mono text-xs uppercase tracking-wider">Message</Label>
                                                    <Textarea
                                                        id="message"
                                                        name="message"
                                                        placeholder="Describe your question or issue..."
                                                        rows={6}
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            // Guest form
                                            <>
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider">Name</Label>
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
                                                        <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider">Email</Label>
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
                                                    <Label htmlFor="message" className="font-mono text-xs uppercase tracking-wider">Message</Label>
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
                                            </>
                                        )}

                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    <span className="uppercase">Sending...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    <span className="uppercase">{isAuthenticated ? 'Start Conversation' : 'Send Message'}</span>
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
