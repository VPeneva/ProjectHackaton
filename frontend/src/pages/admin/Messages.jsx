import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useConversations, useConversation, useSendMessage, useCloseConversation, useReopenConversation } from '@/hooks/useConversations'
import { useContactMessages } from '@/hooks/useAdmin'
import { useAuth } from '@/context/AuthContext'
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
    const isOpen = conversation.status === 'Open'
    const lastMessage = conversation.lastMessage

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left p-4 cursor-pointer border-b transition-colors hover:bg-muted/50 ${isActive ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-medium line-clamp-1">{conversation.subject}</h3>
                <Badge
                    variant="outline"
                    className={isOpen
                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                        : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                    }
                >
                    {isOpen ? 'Open' : 'Closed'}
                </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <User className="h-3 w-3" />
                <span>{conversation.user.name}</span>
                <span>({conversation.user.email})</span>
            </div>
            {lastMessage && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                    {lastMessage.isFromAdmin ? 'You: ' : ''}{lastMessage.content}
                </p>
            )}
            <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                    {conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                </span>
            </div>
        </button>
    )
}

function ChatView({ conversationId, onBack }) {
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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Conversation not found</p>
            </div>
        )
    }

    const isOpen = conversation.status === 'Open'

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="font-semibold">{conversation.subject}</h2>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{conversation.user.name}</span>
                            <a href={`mailto:${conversation.user.email}`} className="text-primary hover:underline">
                                ({conversation.user.email})
                            </a>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={isOpen
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                        }
                    >
                        {isOpen ? 'Open' : 'Closed'}
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
                                    Close
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
                                    Reopen
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
                                className={`max-w-[80%] rounded-lg p-3 ${msg.isFromAdmin
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <div className={`text-xs mt-1 ${msg.isFromAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
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
                <form onSubmit={handleSend} className="p-4 border-t bg-card">
                    <div className="flex gap-2">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your reply..."
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
                <div className="p-4 border-t bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">
                        This conversation is closed. Reopen it to send messages.
                    </p>
                </div>
            )}
        </div>
    )
}

function ConversationSkeleton() {
    return (
        <div className="p-4 border-b">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-full" />
        </div>
    )
}

function ContactMessageCard({ message }) {
    return (
        <Card className="border-0 shadow-md">
            <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{message.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
        <Card className="border-0 shadow-md">
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
        'Failed to load conversations.'
    const contactErrorMessage =
        contactLoadError?.response?.data?.error ||
        contactLoadError?.message ||
        'Failed to load contact messages.'

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="container mx-auto px-4 py-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/admin">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">Messages</h1>
                        <p className="text-sm text-muted-foreground">
                            {openCount} open, {closedCount} closed conversations · {contactCount} contact messages
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-3 border-b">
                <div className="flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant={activeTab === 'conversations' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('conversations')}
                    >
                        Conversations
                    </Button>
                    <Button
                        size="sm"
                        variant={activeTab === 'contact' ? 'default' : 'outline'}
                        onClick={() => {
                            setSelectedId(null)
                            setActiveTab('contact')
                        }}
                    >
                        Contact Form
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {activeTab === 'conversations' ? (
                    <>
                        {/* Conversations List */}
                        <div className={`w-full md:w-80 border-r bg-card flex flex-col ${selectedId ? 'hidden md:flex' : ''}`}>
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
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                            <MessageSquare className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground text-sm">No conversations yet</p>
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
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">Select a Conversation</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Choose a conversation from the list to view and reply
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col bg-muted/20">
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
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                        <Mail className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground text-sm">No contact messages yet</p>
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
