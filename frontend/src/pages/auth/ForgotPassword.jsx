import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Loader2, CheckCircle, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [resetUrl, setResetUrl] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setResetToken('')
    setResetUrl('')
    setLoading(true)

    try {
      const response = await authService.forgotPassword(email)
      setSuccessMessage(response?.message || 'If this email exists, a reset link has been sent.')
      setResetToken(response?.resetToken || '')
      setResetUrl(response?.resetUrl || '')
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to request password reset. Please try again.'
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
            <CardTitle className="text-3xl">RESET PASSWORD</CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-wider">
              [ ENTER YOUR EMAIL TO RECOVER ACCESS ]
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

              {successMessage && (
                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">EMAIL</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {resetToken && (
                <div className="border-3 border-foreground p-3 text-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    <KeyRound className="h-3 w-3" />
                    RESET TOKEN (DEV)
                  </div>
                  <code className="block break-all text-xs bg-muted p-2 font-mono border-2 border-foreground">
                    {resetToken}
                  </code>
                  {resetUrl && (
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link to={resetUrl}>OPEN RESET PAGE</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    SENDING...
                  </>
                ) : (
                  'SEND RESET LINK >>>'
                )}
              </Button>
              <Button variant="ghost" asChild className="text-sm">
                <Link to="/login" className="flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  BACK TO LOGIN
                </Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
