import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useConversations, useConversation, useSendMessage, useCloseConversation, useReopenConversation } from '@/hooks/useConversations'
import { useContactMessages } from '@/hooks/useAdmin'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/I18nContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    MessageSquare,
    Mail,
    User,
    Clock,
    ArrowLeft,
    Send,
    X,
    RefreshCw,
    Loader2,
} from 'lucide-react'

function ConversationItem({ conversation, isActive, onClick }) {
    const { t } = useI18n()
    const isOpen = conversation.status === 'Open'
    const lastMessage = conversation.lastMessage

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left p-4 cursor-pointer border-b-3 border-foreground transition-none hover:bg-foreground hover:text-background ${isActive ? 'bg-foreground text-background' : ''
                }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-medium uppercase line-clamp-1">{conversation.subject}</h3>
                <Badge variant={isOpen ? 'sent' : 'finished'}>
                    {isOpen ? t('admin.openBadge') : t('admin.closedBadge')}
                </Badge>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider opacity-70 mb-2">
                <User className="h-3 w-3" />
                <span>{conversation.user.name}</span>
                <span>({conversation.user.email})</span>
            </div>
            {lastMessage && (
                <p className="text-sm opacity-70 line-clamp-1">
                    {lastMessage.isFromAdmin ? t('admin.youPrefix') : ''}{lastMessage.content}
                </p>
            )}
            <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-xs uppercase tracking-wider opacity-70">
                    {conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}
                </span>
                <span className="font-mono text-xs uppercase tracking-wider opacity-70 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                </span>
            </div>
        </button>
    )
}

function ChatView({ conversationId, onBack }) {
    const { t } = useI18n()
    const { user } = useAuth()
    const { data: conversation, isLoading } = useConversation(conversationId)
    const sendMessage = useSendMessage()
    const closeConversation = useCloseConversation()
    const reopenConversation = useReopenConversation()
    const [message, setMessage] = useState('')
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [conversation?.messages])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!message.trim()) return

        await sendMessage.mutateAsync({
            conversationId,
            content: message.trim(),
        })
        setMessage('')
    }

    const handleClose = () => {
        closeConversation.mutate(conversationId)
    }

    const handleReopen = () => {
        reopenConversation.mutate(conversationId)
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            </div>
        )
    }

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t('admin.convNotFound')}</p>
            </div>
        )
    }

    const isOpen = conversation.status === 'Open'

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b-3 border-foreground flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="font-semibold uppercase">{conversation.subject}</h2>
                        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{conversation.user.name}</span>
                            <a href={`mailto:${conversation.user.email}`} className="text-primary hover:underline">
                                ({conversation.user.email})
                            </a>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={isOpen ? 'sent' : 'finished'}>
                        {isOpen ? t('admin.openBadge') : t('admin.closedBadge')}
                    </Badge>
                    {isOpen ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClose}
                            disabled={closeConversation.isPending}
                            className="text-destructive hover:text-destructive"
                        >
                            {closeConversation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <X className="h-4 w-4 mr-1" />
                                    {t('admin.closeConversation')}
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReopen}
                            disabled={reopenConversation.isPending}
                        >
                            {reopenConversation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    {t('admin.reopenConversation')}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {conversation.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isFromAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] border-3 border-foreground p-3 ${msg.isFromAdmin
                                        ? 'bg-foreground text-background'
                                        : 'bg-muted'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <div className={`font-mono text-xs mt-1 ${msg.isFromAdmin ? 'opacity-70' : 'text-muted-foreground'}`}>
                                    {msg.sender.name} - {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Message Input */}
            {isOpen ? (
                <form onSubmit={handleSend} className="p-4 border-t-3 border-foreground bg-card">
                    <div className="flex gap-2">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('admin.typeReply')}
                            disabled={sendMessage.isPending}
                        />
                        <Button type="submit" disabled={!message.trim() || sendMessage.isPending}>
                            {sendMessage.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="p-4 border-t-3 border-foreground bg-muted text-center">
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        {t('admin.adminConvClosed')}
                    </p>
                </div>
            )}
        </div>
    )
}

function ConversationSkeleton() {
    return (
        <div className="p-4 border-b-3 border-foreground">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-full" />
        </div>
    )
}

function ContactMessageCard({ message }) {
    return (
        <Card>
            <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium uppercase">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{message.name}</span>
                    </div>
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${message.email}`} className="hover:underline">
                        {message.email}
                    </a>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
            </CardContent>
        </Card>
    )
}

function ContactMessageSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-1" />
            </CardContent>
        </Card>
    )
}

export default function Messages() {
    const { t } = useI18n()
    const { data: conversations, isLoading, isError, error } = useConversations()
    const { data: contactMessages, isLoading: contactLoading, isError: contactError, error: contactLoadError } = useContactMessages()
    const [activeTab, setActiveTab] = useState('conversations')
    const [selectedId, setSelectedId] = useState(null)

    const openCount = conversations?.filter(c => c.status === 'Open').length || 0
    const closedCount = conversations?.filter(c => c.status === 'Closed').length || 0
    const contactCount = contactMessages?.length || 0
    const conversationErrorMessage =
        error?.response?.data?.error ||
        error?.message ||
        t('admin.messagesTitle')
    const contactErrorMessage =
        contactLoadError?.response?.data?.error ||
        contactLoadError?.message ||
        t('admin.messagesTitle')

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="container mx-auto px-4 py-4 border-b-3 border-foreground">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/admin">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="font-display text-3xl uppercase">{t('admin.messagesTitle')}</h1>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            {t('admin.messagesCountDesc', { open: openCount, closed: closedCount, contact: contactCount })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-3 border-b-3 border-foreground">
                <div className="flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant={activeTab === 'conversations' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('conversations')}
                    >
                        {t('admin.conversationsTab')}
                    </Button>
                    <Button
                        size="sm"
                        variant={activeTab === 'contact' ? 'default' : 'outline'}
                        onClick={() => {
                            setSelectedId(null)
                            setActiveTab('contact')
                        }}
                    >
                        {t('admin.contactFormTab')}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {activeTab === 'conversations' ? (
                    <>
                        {/* Conversations List */}
                        <div className={`w-full md:w-80 border-r-3 border-foreground bg-card flex flex-col ${selectedId ? 'hidden md:flex' : ''}`}>
                            <ScrollArea className="flex-1">
                                {isLoading ? (
                                    <>
                                        {[...Array(5)].map((_, i) => (
                                            <ConversationSkeleton key={i} />
                                        ))}
                                    </>
                                ) : isError ? (
                                    <div className="p-8 text-center">
                                        <p className="text-muted-foreground">{conversationErrorMessage}</p>
                                    </div>
                                ) : conversations?.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-12 h-12 border-3 border-foreground flex items-center justify-center mx-auto mb-3">
                                            <MessageSquare className="h-6 w-6 text-foreground" />
                                        </div>
                                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t('admin.noConversations')}</p>
                                    </div>
                                ) : (
                                    conversations.map((conv) => (
                                        <ConversationItem
                                            key={conv.id}
                                            conversation={conv}
                                            isActive={conv.id === selectedId}
                                            onClick={() => setSelectedId(conv.id)}
                                        />
                                    ))
                                )}
                            </ScrollArea>
                        </div>

                        {/* Chat View */}
                        {selectedId ? (
                            <ChatView
                                conversationId={selectedId}
                                onBack={() => setSelectedId(null)}
                            />
                        ) : (
                            <div className="hidden md:flex flex-1 items-center justify-center bg-muted/20">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-3 border-foreground flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="h-8 w-8 text-foreground" />
                                    </div>
                                    <h3 className="font-display text-2xl uppercase mb-1">{t('admin.selectConversationTitle')}</h3>
                                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                                        {t('admin.chooseConversation')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <ScrollArea className="flex-1 p-4">
                            {contactLoading ? (
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <ContactMessageSkeleton key={i} />
                                    ))}
                                </div>
                            ) : contactError ? (
                                <div className="p-8 text-center">
                                    <p className="text-muted-foreground">{contactErrorMessage}</p>
                                </div>
                            ) : contactMessages?.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 border-3 border-foreground flex items-center justify-center mx-auto mb-3">
                                        <Mail className="h-6 w-6 text-foreground" />
                                    </div>
                                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t('admin.noContactMessages')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {contactMessages.map((message) => (
                                        <ContactMessageCard key={message.id} message={message} />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                )}
            </div>
        </div>
    )
}
