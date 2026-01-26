import { Link } from 'react-router-dom'
import { useContactMessages } from '@/hooks/useAdmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    MessageSquare,
    Mail,
    User,
    Clock,
    ArrowLeft,
    ExternalLink,
} from 'lucide-react'

function MessageCard({ message }) {
    return (
        <Card className="border-0 shadow-md">
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{message.name}</h3>
                            <a
                                href={`mailto:${message.email}`}
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                                <Mail className="h-3 w-3" />
                                {message.email}
                            </a>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(message.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${message.email}?subject=Re: Your message to CivicReport`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Reply via Email
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function MessageSkeleton() {
    return (
        <Card className="border-0 shadow-md">
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-24 w-full rounded-lg" />
            </CardContent>
        </Card>
    )
}

export default function Messages() {
    const { data: messages, isLoading, isError } = useContactMessages()

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold mb-1">Contact Messages</h1>
                    <p className="text-muted-foreground">
                        View and respond to messages from users.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <Card className="border-0 shadow-lg mb-8 bg-primary/5">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{messages?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Total Messages</p>
                    </div>
                </CardContent>
            </Card>

            {/* Messages List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <MessageSkeleton key={i} />
                    ))}
                </div>
            ) : isError ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">Failed to load messages. Please try again.</p>
                    </CardContent>
                </Card>
            ) : messages?.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                        <p className="text-muted-foreground">
                            Contact form submissions will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {messages.map((message) => (
                        <MessageCard key={message.id} message={message} />
                    ))}
                </div>
            )}
        </div>
    )
}
