import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useConversations, useConversation, useSendMessage, useCreateConversation } from '@/hooks/useConversations'
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
        <div
            onClick={onClick}
            className={`p-4 cursor-pointer border-b transition-colors hover:bg-muted/50 ${isActive ? 'bg-primary/10 border-l-2 border-l-primary' : ''
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
            {lastMessage && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                    {lastMessage.isFromAdmin ? 'Admin: ' : 'You: '}{lastMessage.content}
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
        </div>
    )
}

function ChatView({ conversationId, onBack }) {
    const { data: conversation, isLoading } = useConversation(conversationId)
    const sendMessage = useSendMessage()
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
                        <p className="text-sm text-muted-foreground">
                            Support conversation
                        </p>
                    </div>
                </div>
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

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {conversation.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isFromAdmin ? 'justify-start' : 'justify-end'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${msg.isFromAdmin
                                        ? 'bg-muted'
                                        : 'bg-primary text-primary-foreground'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <div className={`text-xs mt-1 ${msg.isFromAdmin ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
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
                <form onSubmit={handleSend} className="p-4 border-t bg-card">
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
                <div className="p-4 border-t bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">
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
                    <DialogTitle>New Conversation</DialogTitle>
                    <DialogDescription>
                        Start a new conversation with our support team.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="What is this about?"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
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
                            Cancel
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
                            Send Message
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function ConversationSkeleton() {
    return (
        <div className="p-4 border-b">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    )
}

export default function UserMessages() {
    const { data: conversations, isLoading, isError } = useConversations()
    const [selectedId, setSelectedId] = useState(null)
    const [newDialogOpen, setNewDialogOpen] = useState(false)

    const openCount = conversations?.filter(c => c.status === 'Open').length || 0

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="container mx-auto px-4 py-4 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Messages</h1>
                        <p className="text-sm text-muted-foreground">
                            {openCount} open conversation{openCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button onClick={() => setNewDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Message
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Conversations List */}
                <div className={`w-full md:w-80 border-r bg-card flex flex-col ${selectedId ? 'hidden md:flex' : ''}`}>
                    <ScrollArea className="flex-1">
                        {isLoading ? (
                            <>
                                {[...Array(3)].map((_, i) => (
                                    <ConversationSkeleton key={i} />
                                ))}
                            </>
                        ) : isError ? (
                            <div className="p-8 text-center">
                                <p className="text-muted-foreground">Failed to load conversations</p>
                            </div>
                        ) : conversations?.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground text-sm mb-4">No conversations yet</p>
                                <Button size="sm" onClick={() => setNewDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Start a conversation
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
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">Select a Conversation</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Choose a conversation or start a new one
                            </p>
                            <Button onClick={() => setNewDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Message
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
