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

export default function Register() {
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
        { label: 'At least 6 characters', met: formData.password.length >= 6 },
        { label: 'Passwords match', met: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 },
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
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
            toast.success('Account created successfully!')
            navigate('/dashboard', { replace: true })
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to create account. Please try again.'
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
                        <CardTitle className="text-3xl">CREATE ACCOUNT</CardTitle>
                        <CardDescription className="font-mono text-xs uppercase tracking-wider">
                            [ JOIN THE MOVEMENT ]
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
                                <Label htmlFor="name">FULL NAME</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">EMAIL</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">PASSWORD</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">CONFIRM PASSWORD</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your password"
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
                                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">[ REQUIREMENTS ]</span>
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
                                        CREATING ACCOUNT...
                                    </>
                                ) : (
                                    'CREATE ACCOUNT >>>'
                                )}
                            </Button>
                            <p className="text-sm text-center text-muted-foreground">
                                Already registered?{' '}
                                <Link to="/login" className="text-primary hover:underline font-bold uppercase">
                                    SIGN IN
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
