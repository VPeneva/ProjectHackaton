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
            const { token, user } = response.data
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
                {/* Decorative background */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                </div>

                <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-xl shadow-lg">
                                CR
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                        <CardDescription>
                            Join CivicReport to start improving your community
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
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
                                <Label htmlFor="email">Email</Label>
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
                                <Label htmlFor="password">Password</Label>
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
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                            <div className="space-y-2">
                                {passwordRequirements.map((req, index) => (
                                    <div key={index} className="flex items-center space-x-2 text-sm">
                                        <CheckCircle2
                                            className={`h-4 w-4 ${req.met ? 'text-green-500' : 'text-muted-foreground'
                                                }`}
                                        />
                                        <span className={req.met ? 'text-green-500' : 'text-muted-foreground'}>
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
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                            <p className="text-sm text-center text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary hover:underline font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
