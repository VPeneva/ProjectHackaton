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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
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
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{errorMessage}</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">You have no notifications.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-0 shadow-md ${
                notification.isRead ? 'bg-card' : 'bg-primary/5'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{notification.title}</CardTitle>
                  {!notification.isRead && (
                    <Badge variant="secondary">New</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {notification.body && (
                  <p className="text-sm text-muted-foreground">{notification.body}</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    {notification.reportId && (
                      <Button size="sm" variant="link" asChild>
                        <Link to={`/reports/${notification.reportId}`}>View Report</Link>
                      </Button>
                    )}
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markRead.mutate(notification.id)}
                      >
                        Mark read
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
