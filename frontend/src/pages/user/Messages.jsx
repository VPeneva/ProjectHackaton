import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useConversations, useConversation, useSendMessage, useCreateConversation, useCloseConversation } from '@/hooks/useConversations'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    MessageSquare,
    Clock,
    ArrowLeft,
    Send,
    Plus,
    Loader2,
} from 'lucide-react'

function ConversationItem({ conversation, isActive, onClick }) {
    const isOpen = conversation.status === 'Open'
    const lastMessage = conversation.lastMessage

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left p-4 cursor-pointer border-b-3 border-foreground transition-none hover:bg-foreground hover:text-background ${isActive ? 'bg-primary text-primary-foreground' : ''
                }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-display text-lg uppercase line-clamp-1">{conversation.subject}</h3>
                <Badge
                    variant={isOpen ? 'sent' : 'finished'}
                >
                    {isOpen ? 'OPEN' : 'CLOSED'}
                </Badge>
            </div>
            {lastMessage && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                    {lastMessage.isFromAdmin ? 'Admin: ' : 'You: '}{lastMessage.content}
                </p>
            )}
            <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                </span>
            </div>
        </button>
    )
}

function ChatView({ conversationId, onBack }) {
    const { data: conversation, isLoading } = useConversation(conversationId)
    const sendMessage = useSendMessage()
    const closeConversation = useCloseConversation()
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
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Conversation not found</p>
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
                        <h2 className="font-display text-xl uppercase">{conversation.subject}</h2>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            Support conversation
                        </p>
                    </div>
                </div>
                <Badge
                    variant={isOpen ? 'sent' : 'finished'}
                >
                    {isOpen ? 'OPEN' : 'CLOSED'}
                </Badge>
                {isOpen && (
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
                            'CLOSE'
                        )}
                    </Button>
                )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {conversation.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isFromAdmin ? 'justify-start' : 'justify-end'}`}
                        >
                            <div
                                className={`max-w-[80%] border-3 border-foreground p-3 ${msg.isFromAdmin
                                        ? 'bg-muted'
                                        : 'bg-primary text-primary-foreground'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <div className={`font-mono text-xs uppercase tracking-wider mt-1 ${msg.isFromAdmin ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                                    {msg.isFromAdmin ? 'Support' : 'You'} - {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                            placeholder="Type your message..."
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
                        This conversation has been closed by support.
                    </p>
                </div>
            )}
        </div>
    )
}

function NewConversationDialog({ open, onOpenChange }) {
    const createConversation = useCreateConversation()
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!subject.trim() || !message.trim()) return

        await createConversation.mutateAsync({
            subject: subject.trim(),
            message: message.trim(),
        })

        setSubject('')
        setMessage('')
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl uppercase">NEW CONVERSATION</DialogTitle>
                    <DialogDescription className="font-mono text-xs uppercase tracking-wider">
                        Start a new conversation with our support team.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="font-mono text-xs uppercase tracking-wider">SUBJECT</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="What is this about?"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message" className="font-mono text-xs uppercase tracking-wider">MESSAGE</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe your question or issue..."
                                rows={4}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            CANCEL
                        </Button>
                        <Button
                            type="submit"
                            disabled={!subject.trim() || !message.trim() || createConversation.isPending}
                        >
                            {createConversation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            SEND MESSAGE
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function ConversationSkeleton() {
    return (
        <div className="p-4 border-b-3 border-foreground">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    )
}

export default function UserMessages() {
    const { data: conversations, isLoading, isError, error } = useConversations()
    const [selectedId, setSelectedId] = useState(null)
    const [newDialogOpen, setNewDialogOpen] = useState(false)

    const openCount = conversations?.filter(c => c.status === 'Open').length || 0
    const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to load conversations.'

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="container mx-auto px-4 py-4 border-b-3 border-foreground">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-3xl uppercase">MY MESSAGES</h1>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            {openCount} open conversation{openCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button onClick={() => setNewDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        NEW MESSAGE
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Conversations List */}
                <div className={`w-full md:w-80 border-r-3 border-foreground bg-card flex flex-col ${selectedId ? 'hidden md:flex' : ''}`}>
                    <ScrollArea className="flex-1">
                        {isLoading ? (
                            <>
                                {[...Array(3)].map((_, i) => (
                                    <ConversationSkeleton key={i} />
                                ))}
                            </>
                        ) : isError ? (
                            <div className="p-8 text-center">
                                <p className="text-muted-foreground">{errorMessage}</p>
                            </div>
                        ) : conversations?.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-3">
                                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">No conversations yet</p>
                                <Button size="sm" onClick={() => setNewDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    START A CONVERSATION
                                </Button>
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
                            <div className="w-16 h-16 border-3 border-foreground bg-muted flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-display text-2xl uppercase mb-1">SELECT A CONVERSATION</h3>
                            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                                Choose a conversation or start a new one
                            </p>
                            <Button onClick={() => setNewDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                NEW MESSAGE
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <NewConversationDialog
                open={newDialogOpen}
                onOpenChange={setNewDialogOpen}
            />
        </div>
    )
}
