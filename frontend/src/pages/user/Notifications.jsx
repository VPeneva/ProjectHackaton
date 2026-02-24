import { Link } from 'react-router-dom'
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, Check } from 'lucide-react'

export default function Notifications() {
  const { data: notifications = [], isLoading, isError, error } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const errorMessage =
    error?.response?.data?.error || error?.message || 'Failed to load notifications.'

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6 border-b-3 border-foreground pb-6">
        <div>
          <h1 className="font-display text-5xl uppercase">NOTIFICATIONS</h1>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending || unreadCount === 0}
        >
          <Check className="h-4 w-4 mr-1" />
          MARK ALL READ
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{errorMessage}</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-14 h-14 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">You have no notifications.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={
                notification.isRead ? '' : 'border-l-4 border-l-primary'
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="font-display text-lg uppercase">{notification.title}</CardTitle>
                  {!notification.isRead && (
                    <Badge variant="pending">NEW</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {notification.body && (
                  <p className="text-sm text-muted-foreground">{notification.body}</p>
                )}
                <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    {notification.reportId && (
                      <Button size="sm" variant="link" asChild>
                        <Link to={`/reports/${notification.reportId}`}>VIEW REPORT</Link>
                      </Button>
                    )}
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markRead.mutate(notification.id)}
                      >
                        MARK READ
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
