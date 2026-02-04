import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInstitutionReports, useResolveInstitutionReport, useInstitutionResponse } from '@/hooks/useInstitution'
import { useI18n } from '@/context/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, CheckCircle, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'

const statusColors = {
  Pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Sent: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  Finished: 'bg-green-500/10 text-green-600 border-green-500/20',
}

export default function InstitutionDashboard() {
  const { t } = useI18n()
  const { data: reports = [], isLoading, isError, error } = useInstitutionReports()
  const resolveReport = useResolveInstitutionReport()
  const respond = useInstitutionResponse()
  const [activeReportId, setActiveReportId] = useState(null)
  const [responses, setResponses] = useState({})

  const statusLabel = (status) => {
    if (status === 'Pending') return t('statuses.pending')
    if (status === 'Sent') return t('statuses.sent')
    if (status === 'Finished') return t('statuses.finished')
    return status
  }

  const errorMessage =
    error?.response?.data?.error ||
    error?.message ||
    'Failed to load reports.'

  const handleSendResponse = async (reportId) => {
    const content = responses[reportId]?.trim()
    if (!content) return
    await respond.mutateAsync({ reportId, content })
    setResponses((prev) => ({ ...prev, [reportId]: '' }))
    setActiveReportId(null)
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('institution.title')}</h1>
        <p className="text-muted-foreground">{t('institution.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-6">
                <Skeleton className="h-5 w-1/3 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center text-muted-foreground">
            {errorMessage}
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center text-muted-foreground">
            {t('institution.noReports')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      <Link to={`/reports/${report.id}`} className="hover:underline">
                        {report.title}
                      </Link>
                    </CardTitle>
                    {report.address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {report.address}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className={statusColors[report.status] || ''}>
                    {statusLabel(report.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {report.description}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {report.upvotes ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsDown className="h-3 w-3" />
                    {report.downvotes ?? 0}
                  </span>
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setActiveReportId((prev) => (prev === report.id ? null : report.id))
                    }
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {t('institution.respond')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => resolveReport.mutate(report.id)}
                    disabled={resolveReport.isPending || report.status === 'Finished'}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {t('institution.resolve')}
                  </Button>
                </div>

                {activeReportId === report.id && (
                  <div className="space-y-2">
                    <Textarea
                      value={responses[report.id] || ''}
                      onChange={(e) =>
                        setResponses((prev) => ({ ...prev, [report.id]: e.target.value }))
                      }
                      placeholder={t('institution.responsePlaceholder')}
                      rows={3}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSendResponse(report.id)}
                      disabled={respond.isPending || !responses[report.id]?.trim()}
                    >
                      {t('institution.sendResponse')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
