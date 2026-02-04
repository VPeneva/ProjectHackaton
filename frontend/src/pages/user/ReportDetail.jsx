import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    useReport,
    useDeleteReport,
    useComments,
    useAddComment,
    useDeleteComment,
    useSubscription,
    useSubscribe,
    useUnsubscribe,
} from '@/hooks/useReports'
import { useAuth } from '@/context/AuthContext'
import { VoteButtons } from '@/components/reports/VoteButtons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    ArrowLeft,
    MapPin,
    Clock,
    User,
    Building2,
    Tag,
    Trash2,
    CheckCircle,
    Send,
    AlertCircle,
    Bell,
    MessageSquare,
} from 'lucide-react'

const statusConfig = {
    Pending: {
        label: 'Pending',
        color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        icon: Clock,
        description: 'Awaiting review by administrators',
    },
    Sent: {
        label: 'In Progress',
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        icon: Send,
        description: 'Forwarded to the responsible institution',
    },
    Finished: {
        label: 'Resolved',
        color: 'bg-green-500/10 text-green-600 border-green-500/20',
        icon: CheckCircle,
        description: 'Issue has been addressed',
    },
}

function StatusTimeline({ status }) {
    const statuses = ['Pending', 'Sent', 'Finished']
    const currentIndex = statuses.indexOf(status)

    return (
        <div className="flex items-center justify-between">
            {statuses.map((s, index) => {
                const config = statusConfig[s]
                const isActive = index <= currentIndex
                const isCurrent = index === currentIndex

                return (
                    <div key={s} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive
                                        ? isCurrent
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-green-500 text-white'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                <config.icon className="h-5 w-5" />
                            </div>
                            <span className={`text-xs mt-2 ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                                {config.label}
                            </span>
                        </div>
                        {index < statuses.length - 1 && (
                            <div
                                className={`flex-1 h-1 mx-2 rounded ${index < currentIndex ? 'bg-green-500' : 'bg-muted'
                                    }`}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default function ReportDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAdmin } = useAuth()
    const { data: report, isLoading, isError } = useReport(id)
    const { data: comments = [] } = useComments(id)
    const addComment = useAddComment(id)
    const deleteComment = useDeleteComment(id)
    const { data: subscription } = useSubscription(id, !!user)
    const subscribe = useSubscribe(id)
    const unsubscribe = useUnsubscribe(id)
    const deleteReport = useDeleteReport()
    const [commentText, setCommentText] = useState('')
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    useEffect(() => {
        setActiveImageIndex(0)
    }, [report?.id])

    const handleDelete = async () => {
        try {
            await deleteReport.mutateAsync(id)
            navigate('/my-reports')
        } catch (error) {
            // Error handled by mutation
        }
    }

    const handleToggleSubscribe = async () => {
        if (subscription?.subscribed) {
            await unsubscribe.mutateAsync()
        } else {
            await subscribe.mutateAsync()
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!commentText.trim()) return
        await addComment.mutateAsync(commentText.trim())
        setCommentText('')
    }

    const handleDeleteComment = async (commentId) => {
        await deleteComment.mutateAsync(commentId)
    }

    const canDelete = report && (user?.id === report.userId || isAdmin)

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Skeleton className="h-8 w-32 mb-6" />
                <Skeleton className="h-64 w-full mb-6 rounded-lg" />
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        )
    }

    if (isError || !report) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-lg mx-auto border-0 shadow-lg">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
                        <p className="text-muted-foreground mb-4">
                            This report doesn't exist or has been removed.
                        </p>
                        <Button asChild>
                            <Link to="/reports">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const status = statusConfig[report.status] || statusConfig.Pending
    const initialSummary = report?.upvotes !== undefined && report?.downvotes !== undefined
        ? {
            upvotes: report.upvotes ?? 0,
            downvotes: report.downvotes ?? 0,
            total: (report.upvotes ?? 0) + (report.downvotes ?? 0),
        }
        : undefined
    const imageUrls = report.images?.length
        ? report.images.map((image) => image.url)
        : report.imageUrl
            ? [report.imageUrl]
            : []
    const safeImageIndex = Math.min(activeImageIndex, Math.max(imageUrls.length - 1, 0))
    const activeImage = imageUrls[safeImageIndex]

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-6">
                <Link to="/reports">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Reports
                </Link>
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Images */}
                    {imageUrls.length > 0 && (
                        <Card className="border-0 shadow-lg overflow-hidden">
                            <img
                                src={activeImage}
                                alt={report.title}
                                className="w-full aspect-video object-cover"
                            />
                            {imageUrls.length > 1 && (
                                <div className="grid grid-cols-4 gap-2 p-4 bg-card">
                                    {imageUrls.map((url, index) => (
                                        <button
                                            key={`${url}-${index}`}
                                            type="button"
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`rounded-md overflow-hidden border ${
                                                index === safeImageIndex
                                                    ? 'border-primary'
                                                    : 'border-transparent'
                                            }`}
                                        >
                                            <img
                                                src={url}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="h-16 w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Title and Description */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <CardTitle className="text-2xl">{report.title}</CardTitle>
                                <Badge variant="outline" className={status.color}>
                                    <status.icon className="h-3 w-3 mr-1" />
                                    {status.label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {report.description}
                            </p>
                            <div className="mt-6 pt-4 border-t border-border/60">
                                <VoteButtons
                                    reportId={report.id}
                                    status={report.status}
                                    initialSummary={initialSummary}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Timeline */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">Report Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StatusTimeline status={report.status} />
                            <p className="text-sm text-muted-foreground text-center mt-4">
                                {status.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Comments */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Comments
                                <Badge variant="outline" className="ml-2">
                                    {comments.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {comments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No comments yet. Be the first to comment.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((comment) => {
                                        const canDeleteComment =
                                            user?.id === comment.userId || isAdmin
                                        return (
                                            <div key={comment.id} className="border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-medium">{comment.user?.name || 'User'}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(comment.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {canDeleteComment && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {user ? (
                                <form onSubmit={handleAddComment} className="space-y-3">
                                    <Textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Write a comment..."
                                        rows={3}
                                        disabled={addComment.isPending}
                                    />
                                    <Button type="submit" disabled={!commentText.trim() || addComment.isPending}>
                                        {addComment.isPending ? 'Posting...' : 'Post Comment'}
                                    </Button>
                                </form>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    <Link to="/login" className="text-primary hover:underline">
                                        Sign in
                                    </Link>{' '}
                                    to join the discussion.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Details */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Submitted</div>
                                    <div className="text-sm font-medium">
                                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>
                            </div>

                            {report.category && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Category</div>
                                        <div className="text-sm font-medium">{report.category.name}</div>
                                    </div>
                                </div>
                            )}

                            {report.institution && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Institution</div>
                                        <div className="text-sm font-medium">{report.institution.name}</div>
                                    </div>
                                </div>
                            )}

                            {report.address && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Location</div>
                                        <div className="text-sm font-medium">{report.address}</div>
                                    </div>
                                </div>
                            )}

                            {report.user && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Reported by</div>
                                        <Link to={`/users/${report.user.id}`} className="text-sm font-medium text-primary hover:underline">
                                            {report.user.name}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Subscribe */}
                    {user && (
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">Stay Updated</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Get notified about updates and new comments on this report.
                                </p>
                                <Button
                                    variant={subscription?.subscribed ? 'outline' : 'default'}
                                    className="w-full"
                                    onClick={handleToggleSubscribe}
                                    disabled={subscribe.isPending || unsubscribe.isPending}
                                >
                                    <Bell className="mr-2 h-4 w-4" />
                                    {subscription?.subscribed ? 'Subscribed' : 'Subscribe'}
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    {report.subscriptionsCount || 0} watcher{(report.subscriptionsCount || 0) !== 1 ? 's' : ''}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    {canDelete && (
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Report
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Report</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete this report? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
