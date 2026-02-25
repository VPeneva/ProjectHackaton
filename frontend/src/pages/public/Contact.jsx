import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/I18nContext'
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
    const { t } = useI18n()
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
                await createConversation.mutateAsync({
                    subject: formData.subject,
                    message: formData.message,
                })
                setSuccess(true)
                setFormData({ subject: '', name: '', email: '', message: '' })
            } else {
                await contactService.submit({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                })
                setSuccess(true)
                setFormData({ subject: '', name: '', email: '', message: '' })
                toast.success(t('contact.messageSentSuccess'))
            }
        } catch (err) {
            const message = err.response?.data?.error || t('contact.failedSendMessage')
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const contactInfo = [
        {
            icon: Mail,
            title: t('contact.email'),
            value: 'contact@civicreport.com',
            href: 'mailto:contact@civicreport.com',
        },
        {
            icon: Phone,
            title: t('contact.phone'),
            value: '+1 (555) 123-4567',
            href: 'tel:+15551234567',
        },
        {
            icon: MapPin,
            title: t('contact.address'),
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
                            {t('contact.getInTouch')}
                        </h1>
                        <div className="border-b-3 border-foreground w-24 mx-auto mb-4" />
                        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                            {t('contact.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h2 className="font-display text-2xl uppercase">{t('contact.contactInfo')}</h2>
                        <p className="text-muted-foreground">
                            {t('contact.contactInfoDesc')}
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
                                            <h3 className="font-bold uppercase mb-1">{t('contact.wantLiveChat')}</h3>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {t('contact.liveChatDesc')}
                                            </p>
                                            <Button size="sm" asChild>
                                                <Link to="/login">
                                                    <LogIn className="h-4 w-4 mr-2" />
                                                    <span className="uppercase">{t('contact.signIn')}</span>
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
                                    {isAuthenticated ? t('contact.startConversation') : t('contact.sendMessage')}
                                </CardTitle>
                                <CardDescription>
                                    {isAuthenticated
                                        ? t('contact.conversationDesc')
                                        : t('contact.guestFormDesc')
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {success ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="h-8 w-8 text-foreground" />
                                        </div>
                                        <h3 className="font-display text-xl uppercase mb-2">{t('contact.messageSent')}</h3>
                                        <p className="text-muted-foreground mb-6">
                                            {isAuthenticated
                                                ? t('contact.conversationStarted')
                                                : t('contact.thankYou')
                                            }
                                        </p>
                                        {isAuthenticated ? (
                                            <div className="flex gap-3 justify-center">
                                                <Button variant="outline" onClick={() => setSuccess(false)} className="hover:bg-foreground hover:text-background transition-none">
                                                    <span className="uppercase">{t('contact.sendAnother')}</span>
                                                </Button>
                                                <Button onClick={() => navigate('/messages')}>
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    <span className="uppercase">{t('contact.viewMessages')}</span>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button variant="outline" onClick={() => setSuccess(false)} className="hover:bg-foreground hover:text-background transition-none">
                                                <span className="uppercase">{t('contact.sendAnotherMessage')}</span>
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
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="subject" className="font-mono text-xs uppercase tracking-wider">{t('contact.subject')}</Label>
                                                    <Input
                                                        id="subject"
                                                        name="subject"
                                                        placeholder={t('contact.subjectPlaceholder')}
                                                        value={formData.subject}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="message" className="font-mono text-xs uppercase tracking-wider">{t('contact.message')}</Label>
                                                    <Textarea
                                                        id="message"
                                                        name="message"
                                                        placeholder={t('contact.messagePlaceholder')}
                                                        rows={6}
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider">{t('contact.name')}</Label>
                                                        <Input
                                                            id="name"
                                                            name="name"
                                                            placeholder={t('contact.namePlaceholder')}
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider">{t('contact.email')}</Label>
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
                                                    <Label htmlFor="message" className="font-mono text-xs uppercase tracking-wider">{t('contact.message')}</Label>
                                                    <Textarea
                                                        id="message"
                                                        name="message"
                                                        placeholder={t('contact.messagePlaceholderGuest')}
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
                                                    <span className="uppercase">{t('contact.sending')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    <span className="uppercase">{isAuthenticated ? t('contact.startConversationBtn') : t('contact.sendMessageBtn')}</span>
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
