import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authService } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Lock, KeyRound } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const initialToken = searchParams.get('token') || ''
    setToken(initialToken)
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token.trim()) {
      setError('Reset token is required')
      return
    }

    if (!password) {
      setError('Please enter a new password')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token.trim(), password)
      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to reset password. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-brutal">
          <CardHeader className="space-y-2 text-center border-b-3 border-foreground">
            <div className="flex justify-center mb-2">
              <div className="flex h-14 w-14 items-center justify-center border-3 border-foreground bg-primary text-primary-foreground font-display text-2xl">
                CR
              </div>
            </div>
            <CardTitle className="text-3xl">NEW PASSWORD</CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-wider">
              [ SET A STRONG PASSWORD ]
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

              {success && (
                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Password reset successful. You can now sign in.</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="token">RESET TOKEN</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="token"
                    type="text"
                    placeholder="Paste your reset token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">NEW PASSWORD</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter a new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    type="password"
                    placeholder="Repeat your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    RESETTING...
                  </>
                ) : (
                  'RESET PASSWORD >>>'
                )}
              </Button>
              <Button variant="ghost" asChild className="text-sm">
                <Link to="/login">BACK TO LOGIN</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
