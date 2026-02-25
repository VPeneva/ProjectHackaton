import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useI18n } from '@/context/I18nContext'

export default function Login() {
    const { t } = useI18n()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || '/dashboard'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { token, user } = await authService.login(email, password)
            login(user, token)
            toast.success(t('auth.welcomeBack', { name: user.name }))
            navigate(from, { replace: true })
        } catch (err) {
            const message = err.response?.data?.error || t('auth.failedSignIn')
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-brutal">
                    <CardHeader className="space-y-1 text-center border-b-3 border-foreground">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-14 w-14 items-center justify-center border-3 border-foreground bg-primary text-primary-foreground font-display text-2xl">
                                CR
                            </div>
                        </div>
                        <CardTitle className="text-3xl">{t('auth.signIn')}</CardTitle>
                        <CardDescription className="font-mono text-xs uppercase tracking-wider">
                            {t('auth.accessYourAccount')}
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
                                <Label htmlFor="email">{t('auth.email')}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={t('auth.emailPlaceholder')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">{t('auth.password')}</Label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-primary hover:underline font-bold uppercase tracking-wider"
                                    >
                                        {t('auth.forgot')}
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder={t('auth.passwordPlaceholder')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('auth.signingIn')}
                                    </>
                                ) : (
                                    t('auth.signInAction')
                                )}
                            </Button>
                            <p className="text-sm text-center text-muted-foreground">
                                {t('auth.noAccount')}{' '}
                                <Link to="/register" className="text-primary hover:underline font-bold uppercase">
                                    {t('auth.createOne')}
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
