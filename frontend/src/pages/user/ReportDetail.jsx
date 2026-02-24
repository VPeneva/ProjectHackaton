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
    useSimilarReports,
} from '@/hooks/useReports'
import { useAuth } from '@/context/AuthContext'
import { VoteButtons } from '@/components/reports/VoteButtons'
import SharePanel from '@/components/reports/SharePanel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/context/I18nContext'
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
        labelKey: 'statuses.pending',
        variant: 'pending',
        stamp: 'PENDING',
        icon: Clock,
        descriptionKey: 'reportDetail.pendingDesc',
    },
    Sent: {
        labelKey: 'statuses.sent',
        variant: 'sent',
        stamp: 'SENT',
        icon: Send,
        descriptionKey: 'reportDetail.sentDesc',
    },
    Finished: {
        labelKey: 'statuses.finished',
        variant: 'finished',
        stamp: 'RESOLVED',
        icon: CheckCircle,
        descriptionKey: 'reportDetail.finishedDesc',
    },
}

function StatusTimeline({ status, t }) {
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
                                className={`w-10 h-10 border-3 border-foreground flex items-center justify-center transition-none ${isActive
                                        ? isCurrent
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-foreground text-background'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                <config.icon className="h-5 w-5" />
                            </div>
                            <span className={`font-mono text-xs uppercase tracking-wider mt-2 ${isActive ? 'font-bold' : 'text-muted-foreground'}`}>
                                {t(config.labelKey)}
                            </span>
                        </div>
                        {index < statuses.length - 1 && (
                            <div
                                className={`flex-1 h-1 mx-2 ${index < currentIndex ? 'bg-foreground' : 'bg-muted'}`}
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
    const { t } = useI18n()
    const { data: report, isLoading, isError } = useReport(id)
    const { data: comments = [] } = useComments(id)
    const { data: similarReports = [] } = useSimilarReports(id, 4)
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
                <Skeleton className="h-64 w-full mb-6" />
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        )
    }

    if (isError || !report) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-lg mx-auto">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 border-3 border-foreground flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8" />
                        </div>
                        <h2 className="font-display text-3xl mb-2">REPORT NOT FOUND</h2>
                        <p className="text-muted-foreground font-mono text-sm uppercase mb-4">
                            This report doesn't exist or has been removed.
                        </p>
                        <Button asChild>
                            <Link to="/reports">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                BACK TO REPORTS
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const status = statusConfig[report.status] || statusConfig.Pending
    const statusLabel = t(status.labelKey)
    const statusDescription = t(status.descriptionKey)
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
                    {t('reportDetail.back')}
                </Link>
            </Button>

            {/* Report ID Header */}
            <div className="mb-6 border-b-3 border-foreground pb-4">
                <span className="font-mono text-xs text-primary uppercase tracking-wider">
                    RPT-{String(report.id).padStart(4, '0')}
                </span>
                <h1 className="font-display text-4xl md:text-6xl mt-1">{report.title}</h1>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Images */}
                    {imageUrls.length > 0 && (
                        <Card className="overflow-hidden">
                            <img
                                src={activeImage}
                                alt={report.title}
                                className="w-full aspect-video object-cover"
                            />
                            {imageUrls.length > 1 && (
                                <div className="grid grid-cols-4 gap-2 p-4 border-t-3 border-foreground">
                                    {imageUrls.map((url, index) => (
                                        <button
                                            key={`${url}-${index}`}
                                            type="button"
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`overflow-hidden border-3 ${
                                                index === safeImageIndex
                                                    ? 'border-primary'
                                                    : 'border-foreground'
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

                    {/* Description */}
                    <Card>
                        <CardHeader className="border-b-3 border-foreground">
                            <div className="flex items-start justify-between gap-4">
                                <CardTitle>{t('reportDetail.details')}</CardTitle>
                                <Badge variant={status.variant}>
                                    {status.stamp}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {report.description}
                            </p>
                            <div className="mt-6 pt-4 border-t-3 border-foreground">
                                <VoteButtons
                                    reportId={report.id}
                                    status={report.status}
                                    initialSummary={initialSummary}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Timeline */}
                    <Card>
                        <CardHeader className="border-b-3 border-foreground">
                            <CardTitle>{t('reportDetail.reportStatus')}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <StatusTimeline status={report.status} t={t} />
                            <p className="font-mono text-xs text-muted-foreground text-center mt-4 uppercase">
                                {statusDescription}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Comments */}
                    <Card>
                        <CardHeader className="border-b-3 border-foreground">
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                {t('reportDetail.comments')}
                                <Badge variant="outline" className="ml-2">
                                    {comments.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {comments.length === 0 ? (
                                <p className="font-mono text-sm text-muted-foreground uppercase">
                                    {t('reportDetail.noComments')}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((comment) => {
                                        const canDeleteComment =
                                            user?.id === comment.userId || isAdmin
                                        return (
                                            <div key={comment.id} className="border-b-3 border-foreground pb-4 last:border-b-0 last:pb-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-bold uppercase">{comment.user?.name || 'User'}</p>
                                                        <p className="font-mono text-xs text-muted-foreground">
                                                            {new Date(comment.createdAt).toLocaleString()}
                                                        </p>
                                                        {comment.user?.role === 'INSTITUTION' && (
                                                            <Badge variant="outline" className="mt-1 text-xs">
                                                                {t('reportDetail.institutionResponse')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {canDeleteComment && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            aria-label="Delete comment"
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
                                <form onSubmit={handleAddComment} className="space-y-3 border-t-3 border-foreground pt-4">
                                    <Textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Write a comment..."
                                        rows={3}
                                        disabled={addComment.isPending}
                                    />
                                    <Button type="submit" disabled={!commentText.trim() || addComment.isPending}>
                                        {addComment.isPending ? 'POSTING...' : t('reportDetail.postComment')}
                                    </Button>
                                </form>
                            ) : (
                                <p className="font-mono text-sm text-muted-foreground uppercase">
                                    <Link to="/login" className="text-primary hover:underline font-bold">
                                        {t('nav.signIn')}
                                    </Link>{' '}
                                    {t('reportDetail.signInToComment')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Details */}
                    <Card>
                        <CardHeader className="border-b-3 border-foreground">
                            <CardTitle>{t('reportDetail.details')}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 border-3 border-foreground bg-muted flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="font-mono text-xs text-muted-foreground uppercase">{t('reportDetail.submitted')}</div>
                                    <div className="text-sm font-bold">
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
                                    <div className="w-8 h-8 border-3 border-foreground bg-muted flex items-center justify-center">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-mono text-xs text-muted-foreground uppercase">{t('reportDetail.category')}</div>
                                        <div className="text-sm font-bold">{report.category.name}</div>
                                    </div>
                                </div>
                            )}

                            {report.institution && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 border-3 border-foreground bg-muted flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-mono text-xs text-muted-foreground uppercase">{t('reportDetail.institution')}</div>
                                        <div className="text-sm font-bold">{report.institution.name}</div>
                                    </div>
                                </div>
                            )}

                            {report.address && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 border-3 border-foreground bg-muted flex items-center justify-center">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-mono text-xs text-muted-foreground uppercase">{t('reportDetail.location')}</div>
                                        <div className="text-sm font-bold">{report.address}</div>
                                    </div>
                                </div>
                            )}

                            {report.user && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 border-3 border-foreground bg-muted flex items-center justify-center">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-mono text-xs text-muted-foreground uppercase">{t('reportDetail.reportedBy')}</div>
                                        <Link to={`/users/${report.user.id}`} className="text-sm font-bold text-primary hover:underline uppercase">
                                            {report.user.name}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Subscribe */}
                    {user && (
                        <Card>
                            <CardHeader className="border-b-3 border-foreground">
                                <CardTitle>{t('reportDetail.stayUpdated')}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <p className="font-mono text-xs text-muted-foreground uppercase">
                                    Get notified about updates and new comments on this report.
                                </p>
                                <Button
                                    variant={subscription?.subscribed ? 'outline' : 'default'}
                                    className="w-full"
                                    onClick={handleToggleSubscribe}
                                    disabled={subscribe.isPending || unsubscribe.isPending}
                                >
                                    <Bell className="mr-2 h-4 w-4" />
                                    {subscription?.subscribed ? t('reportDetail.subscribed') : t('reportDetail.subscribe')}
                                </Button>
                                <p className="font-mono text-xs text-muted-foreground uppercase">
                                    {report.subscriptionsCount || 0} watcher{(report.subscriptionsCount || 0) !== 1 ? 's' : ''}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Share */}
                    <SharePanel report={report} statusLabel={statusLabel} />

                    {/* Similar Reports */}
                    <Card>
                        <CardHeader className="border-b-3 border-foreground">
                            <CardTitle>{t('reportDetail.similarReports')}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            {similarReports.length === 0 ? (
                                <p className="font-mono text-sm text-muted-foreground uppercase">
                                    {t('reportDetail.noSimilar')}
                                </p>
                            ) : (
                                similarReports.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={`/reports/${item.id}`}
                                        className="block border-3 border-foreground p-3 hover:bg-foreground hover:text-background transition-none"
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="text-sm font-bold uppercase line-clamp-1">{item.title}</p>
                                            <Badge variant={statusConfig[item.status]?.variant || status.variant}>
                                                {statusConfig[item.status]?.stamp || status.stamp}
                                            </Badge>
                                        </div>
                                        <p className="font-mono text-xs text-muted-foreground line-clamp-2">
                                            {item.description}
                                        </p>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    {canDelete && (
                        <Card>
                            <CardHeader className="border-b-3 border-foreground">
                                <CardTitle>{t('reportDetail.actions')}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t('reportDetail.deleteReport')}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t('reportDetail.deleteReport')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t('reportDetail.deleteConfirm')}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('reportDetail.cancel')}</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {t('reportDetail.delete')}
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
