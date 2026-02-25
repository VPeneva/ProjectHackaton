import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Share2, Copy, Download, Twitter, Facebook, Linkedin } from 'lucide-react'
import { generateShareImage } from '@/lib/shareImage'
import { toast } from 'sonner'
import { useI18n } from '@/context/I18nContext'

export default function SharePanel({ report, statusLabel }) {
  const { t } = useI18n()
  const [isGenerating, setIsGenerating] = useState(false)

  if (!report) return null

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/reports/${report.id}`
      : ''
  const shareText = `${report.title} - ${statusLabel}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t('share.copied'))
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: shareText,
          url: shareUrl,
        })
        return
      } catch (err) {
        // fall back to links
      }
    }
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    )
  }

  const handleDownloadImage = async () => {
    setIsGenerating(true)
    const dataUrl = await generateShareImage({
      title: report.title,
      statusLabel,
      address: report.address,
      imageUrl: report.images?.[0]?.url || report.imageUrl,
    })
    setIsGenerating(false)
    if (!dataUrl) {
      toast.error('Failed to generate share image')
      return
    }

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `cityclarity-${report.id}.png`
    link.click()
  }

  return (
    <Card>
      <CardHeader className="border-b-3 border-foreground">
        <CardTitle>{t('reportDetail.share')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          {t('share.copyLink')}
        </Button>
        <Button variant="default" className="w-full" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          {t('share.shareNow')}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleDownloadImage}
          disabled={isGenerating}
        >
          <Download className="mr-2 h-4 w-4" />
          {t('share.downloadImage')}
        </Button>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  shareText
                )}&url=${encodeURIComponent(shareUrl)}`,
                '_blank'
              )
            }
            aria-label="Share on Twitter"
          >
            <Twitter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl
                )}`,
                '_blank'
              )
            }
            aria-label="Share on Facebook"
          >
            <Facebook className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                  shareUrl
                )}&title=${encodeURIComponent(report.title)}`,
                '_blank'
              )
            }
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
