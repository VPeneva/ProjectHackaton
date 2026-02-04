import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin, useSendReport, useResolveReport, useBulkSendReports, useBulkResolveReports, useMergeReports } from '@/hooks/useAdmin'
import { useInstitutions } from '@/hooks/useInstitutions'
import { useSimilarReports } from '@/hooks/useReports'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Eye,
    Send,
    CheckCircle,
    Clock,
    Building2,
    MapPin,
    Loader2,
    FileText,
    ThumbsUp,
    ThumbsDown,
    GitMerge,
} from 'lucide-react'
import { toast } from 'sonner'

const statusConfig = {
    Pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    Sent: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
}

function ReportRow({ report, onSend, onResolve, institutions, selected, onToggleSelect, onMerge }) {
    const [sendDialogOpen, setSendDialogOpen] = useState(false)
    const [selectedInstitution, setSelectedInstitution] = useState('')
    const [sending, setSending] = useState(false)
    const [resolving, setResolving] = useState(false)

    const status = statusConfig[report.status] || statusConfig.Pending
    const imageUrl = report.images?.[0]?.url || report.imageUrl
    const upvotes = report.upvotes ?? 0
    const downvotes = report.downvotes ?? 0
    const totalVotes = upvotes + downvotes
    const ratio = totalVotes ? upvotes / totalVotes : 0
    const communityBadge =
        totalVotes === 0
            ? { label: 'No votes yet', className: 'bg-muted text-muted-foreground border-border/60' }
            : ratio >= 0.7
                ? { label: 'Community validated', className: 'bg-green-500/10 text-green-600 border-green-500/20' }
                : ratio <= 0.3
                    ? { label: 'Needs review', className: 'bg-rose-500/10 text-rose-600 border-rose-500/20' }
                    : { label: 'Mixed feedback', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' }

    const handleSend = async () => {
        if (!selectedInstitution) {
            toast.error('Please select an institution')
            return
        }
        setSending(true)
        await onSend(report.id, parseInt(selectedInstitution))
        setSending(false)
        setSendDialogOpen(false)
    }

    const handleResolve = async () => {
        setResolving(true)
        await onResolve(report.id)
        setResolving(false)
    }

    return (
        <>
            <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => onToggleSelect(report.id)}
                                className="mt-1 h-4 w-4 accent-primary"
                            />
                        </div>
                        {/* Image */}
                        {imageUrl && (
                            <div className="w-full lg:w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                                <img
                                    src={imageUrl}
                                    alt={report.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-semibold line-clamp-1">{report.title}</h3>
                                <Badge variant="outline" className={status.color}>
                                    {status.label}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {report.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                {report.category && (
                                    <span className="flex items-center gap-1">
                                        <Building2 className="h-3 w-3" />
                                        {report.category.name}
                                    </span>
                                )}
                                {report.address && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {report.address}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 text-emerald-600">
                                    <ThumbsUp className="h-3 w-3" />
                                    {upvotes}
                                </span>
                                <span className="flex items-center gap-1 text-rose-600">
                                    <ThumbsDown className="h-3 w-3" />
                                    {downvotes}
                                </span>
                                <Badge variant="outline" className={communityBadge.className}>
                                    {communityBadge.label}
                                </Badge>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" size="sm" asChild>
                                <Link to={`/reports/${report.id}`}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </Link>
                            </Button>

                            <Button variant="outline" size="sm" onClick={() => onMerge(report)}>
                                <GitMerge className="h-4 w-4 mr-1" />
                                Merge
                            </Button>

                            {report.status === 'Pending' && (
                                <Button size="sm" onClick={() => setSendDialogOpen(true)}>
                                    <Send className="h-4 w-4 mr-1" />
                                    Send
                                </Button>
                            )}

                            {report.status === 'Sent' && (
                                <Button
                                    size="sm"
                                    variant="success"
                                    onClick={handleResolve}
                                    disabled={resolving}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {resolving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Resolve
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Send Dialog */}
            <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Report to Institution</DialogTitle>
                        <DialogDescription>
                            Select the institution responsible for handling this report.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select institution" />
                            </SelectTrigger>
                            <SelectContent>
                                {institutions?.map((inst) => (
                                    <SelectItem key={inst.id} value={inst.id.toString()}>
                                        {inst.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSend} disabled={sending || !selectedInstitution}>
                            {sending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            Send Report
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

function ReportSkeleton() {
    return (
        <Card className="border-0 shadow-md">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
                    <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ManageReports() {
    const [filter, setFilter] = useState('all')
    const [selectedIds, setSelectedIds] = useState([])
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
    const [bulkInstitution, setBulkInstitution] = useState('')
    const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
    const [mergeSource, setMergeSource] = useState(null)
    const [mergeTargetId, setMergeTargetId] = useState('')
    const { data: reports, isLoading, isError, error } = useAdmin()
    const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to load reports. Please try again.'
    const { data: institutions } = useInstitutions()
    const sendReport = useSendReport()
    const resolveReport = useResolveReport()
    const bulkSend = useBulkSendReports()
    const bulkResolve = useBulkResolveReports()
    const mergeReports = useMergeReports()

    const { data: similarReports = [] } = useSimilarReports(
        mergeSource?.id,
        6,
        mergeDialogOpen
    )

    const handleSend = async (id, institutionId) => {
        try {
            await sendReport.mutateAsync({ id, institutionId })
        } catch (error) {
            // Error handled by mutation
        }
    }

    const handleResolve = async (id) => {
        try {
            await resolveReport.mutateAsync(id)
        } catch (error) {
            // Error handled by mutation
        }
    }

    const filteredReports = reports?.filter((report) => {
        if (filter === 'all') return true
        return report.status === filter
    }) || []

    const allSelected = filteredReports.length > 0 && selectedIds.length === filteredReports.length

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredReports.map((report) => report.id))
        }
    }

    const handleBulkSend = async () => {
        if (!bulkInstitution) {
            toast.error('Please select an institution')
            return
        }
        await bulkSend.mutateAsync({
            ids: selectedIds,
            institutionId: parseInt(bulkInstitution, 10),
        })
        setSelectedIds([])
        setBulkDialogOpen(false)
        setBulkInstitution('')
    }

    const handleBulkResolve = async () => {
        await bulkResolve.mutateAsync({ ids: selectedIds })
        setSelectedIds([])
    }

    const handleOpenMerge = (report) => {
        setMergeSource(report)
        setMergeTargetId('')
        setMergeDialogOpen(true)
    }

    const handleMerge = async () => {
        if (!mergeSource || !mergeTargetId) {
            toast.error('Select a target report to merge into')
            return
        }

        await mergeReports.mutateAsync({
            sourceId: mergeSource.id,
            targetId: parseInt(mergeTargetId, 10),
        })

        setMergeDialogOpen(false)
        setMergeSource(null)
        setMergeTargetId('')
    }

    const pendingCount = reports?.filter(r => r.status === 'Pending').length || 0
    const sentCount = reports?.filter(r => r.status === 'Sent').length || 0

    useEffect(() => {
        setSelectedIds([])
    }, [filter, reports])

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Manage Reports</h1>
                    <p className="text-muted-foreground">
                        Review, forward, and resolve submitted reports.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 accent-primary"
                        />
                        Select all
                    </label>
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        size="sm"
                    >
                        All ({(pendingCount + sentCount)})
                    </Button>
                    <Button
                        variant={filter === 'Pending' ? 'default' : 'outline'}
                        onClick={() => setFilter('Pending')}
                        size="sm"
                    >
                        Pending ({pendingCount})
                    </Button>
                    <Button
                        variant={filter === 'Sent' ? 'default' : 'outline'}
                        onClick={() => setFilter('Sent')}
                        size="sm"
                    >
                        In Progress ({sentCount})
                    </Button>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <Card className="border-0 shadow-lg mb-6">
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="text-sm text-muted-foreground">
                            {selectedIds.length} report{selectedIds.length !== 1 ? 's' : ''} selected
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                onClick={() => setBulkDialogOpen(true)}
                                disabled={bulkSend.isPending}
                            >
                                <Send className="h-4 w-4 mr-1" />
                                Bulk Send
                            </Button>
                            <Button
                                size="sm"
                                variant="success"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleBulkResolve}
                                disabled={bulkResolve.isPending}
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Bulk Resolve
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reports List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <ReportSkeleton key={i} />
                    ))}
                </div>
            ) : isError ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">{errorMessage}</p>
                    </CardContent>
                </Card>
            ) : filteredReports.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                        <p className="text-muted-foreground">
                            {filter === 'all'
                                ? 'No pending or in-progress reports at the moment.'
                                : `No ${filter === 'Pending' ? 'pending' : 'in-progress'} reports.`}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredReports.map((report) => (
                        <ReportRow
                            key={report.id}
                            report={report}
                            onSend={handleSend}
                            onResolve={handleResolve}
                            institutions={institutions}
                            selected={selectedIds.includes(report.id)}
                            onToggleSelect={toggleSelect}
                            onMerge={handleOpenMerge}
                        />
                    ))}
                </div>
            )}

            {/* Bulk Send Dialog */}
            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Reports to Institution</DialogTitle>
                        <DialogDescription>
                            Select the institution responsible for the selected reports.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={bulkInstitution} onValueChange={setBulkInstitution}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select institution" />
                            </SelectTrigger>
                            <SelectContent>
                                {institutions?.map((inst) => (
                                    <SelectItem key={inst.id} value={inst.id.toString()}>
                                        {inst.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleBulkSend} disabled={bulkSend.isPending || !bulkInstitution}>
                            {bulkSend.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            Send Reports
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Merge Dialog */}
            <Dialog
                open={mergeDialogOpen}
                onOpenChange={(open) => {
                    setMergeDialogOpen(open)
                    if (!open) {
                        setMergeSource(null)
                        setMergeTargetId('')
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Merge Duplicate Reports</DialogTitle>
                        <DialogDescription>
                            Merge "{mergeSource?.title}" into another report. The source report will be removed,
                            while votes, comments, and subscriptions will be moved to the target.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Select a target report</p>
                            {similarReports.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No similar reports found. Enter a target report ID below.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {similarReports.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setMergeTargetId(item.id.toString())}
                                            className={`w-full text-left p-2 rounded-md border ${
                                                mergeTargetId === item.id.toString()
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border/60'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium line-clamp-1">
                                                    {item.title}
                                                </span>
                                                <Badge variant="outline" className={statusConfig[item.status]?.color || ''}>
                                                    {statusConfig[item.status]?.label || item.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {item.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Target report ID (optional)</p>
                            <Input
                                placeholder="Enter report ID"
                                value={mergeTargetId}
                                onChange={(e) => setMergeTargetId(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleMerge} disabled={mergeReports.isPending}>
                            {mergeReports.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <GitMerge className="h-4 w-4 mr-2" />
                            )}
                            Merge Reports
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
