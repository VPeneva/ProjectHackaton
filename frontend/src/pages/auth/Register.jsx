import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useI18n } from '@/context/I18nContext'

export default function Register() {
    const { t } = useI18n()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const passwordRequirements = [
        { label: t('auth.atLeast6Chars'), met: formData.password.length >= 6 },
        { label: t('auth.passwordsMatch'), met: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 },
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError(t('auth.passwordsDoNotMatch'))
            return
        }

        if (formData.password.length < 6) {
            setError(t('auth.passwordMinLength'))
            return
        }

        setLoading(true)

        try {
            const response = await authService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            })
            const { token, user } = response
            login(user, token)
            toast.success(t('auth.accountCreated'))
            navigate('/dashboard', { replace: true })
        } catch (err) {
            const message = err.response?.data?.error || t('auth.failedCreateAccount')
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                <Card className="shadow-brutal">
                    <CardHeader className="space-y-1 text-center border-b-3 border-foreground">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-14 w-14 items-center justify-center border-3 border-foreground bg-primary text-primary-foreground font-display text-2xl">
                                CR
                            </div>
                        </div>
                        <CardTitle className="text-3xl">{t('auth.createAccount')}</CardTitle>
                        <CardDescription className="font-mono text-xs uppercase tracking-wider">
                            {t('auth.joinTheMovement')}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4 pt-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">{t('auth.fullName')}</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder={t('auth.namePlaceholder')}
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">{t('auth.email')}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder={t('auth.emailPlaceholder')}
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t('auth.password')}</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder={t('auth.createPasswordPlaceholder')}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder={t('auth.confirmPasswordPlaceholder')}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Password requirements */}
                            <div className="space-y-2 border-3 border-foreground p-3">
                                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t('auth.requirements')}</span>
                                {passwordRequirements.map((req, index) => (
                                    <div key={index} className="flex items-center space-x-2 text-sm">
                                        <CheckCircle2
                                            className={`h-4 w-4 ${req.met ? 'text-foreground' : 'text-muted-foreground'}`}
                                        />
                                        <span className={`font-mono text-xs uppercase ${req.met ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('auth.creatingAccount')}
                                    </>
                                ) : (
                                    t('auth.createAccountAction')
                                )}
                            </Button>
                            <p className="text-sm text-center text-muted-foreground">
                                {t('auth.alreadyRegistered')}{' '}
                                <Link to="/login" className="text-primary hover:underline font-bold uppercase">
                                    {t('auth.signIn')}
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
