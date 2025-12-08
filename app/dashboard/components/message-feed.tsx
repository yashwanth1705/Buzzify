'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { Message } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { MessageSquare, User, Clock, CheckCircle } from 'lucide-react'
import MessageSearchFilter from './message-search-filter'
import EmptyState from './empty-state'

interface MessageFeedProps {
  onSelectMessage: (messageId: number) => void
}

export default function MessageFeed({ onSelectMessage }: MessageFeedProps) {
  const { messages, currentUser, acknowledgeMessage, markMessageAsRead, groups } = useStore()

  // Memoize visible messages to avoid creating a new array each render
  const visibleMessages = useMemo(() => {
    try {
      const filtered = messages.filter(message => {
        if (currentUser?.role === 'admin') return true

        const isStudent = currentUser?.role === 'student'
        const isStaff = currentUser?.role === 'staff'

        if (message.recipients === 'all') return true
        if (isStudent && (message.recipients === 'students' || message.recipients === 'student')) return true
        if (isStaff && message.recipients === 'staff') return true

        if (message.sender === currentUser?.name) return true

        if (message.custom_groups && message.custom_groups.length > 0) {
          const userGroups = (groups || []).filter(g =>
            message.custom_groups?.includes(g.id) &&
            g.members?.includes(currentUser?.email || '')
          )
          if (userGroups.length > 0) return true
        }

        if (message.recipients === 'manual' && message.manual_recipients && currentUser?.email) {
          if (message.manual_recipients.includes(currentUser.email)) return true
        }

        return false
      })

      return filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    } catch (e) {
      console.error('Error computing visibleMessages:', e)
      return []
    }
  }, [messages, currentUser?.role, currentUser?.email, groups])

  const [filteredMessages, setFilteredMessages] = useState<Message[]>(visibleMessages)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 dark:border-l-red-400'
      case 'medium': return 'border-l-orange-500 dark:border-l-orange-400'
      case 'low': return 'border-l-green-500 dark:border-l-green-400'
      default: return 'border-l-gray-300 dark:border-l-gray-600'
    }
  }

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'hover:bg-red-50 dark:hover:bg-red-900/10'
      case 'medium': return 'hover:bg-orange-50 dark:hover:bg-orange-900/10'
      case 'low': return 'hover:bg-green-50 dark:hover:bg-green-900/10'
      default: return ''
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700'
      case 'staff': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'
      case 'student': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getSenderDetails = (senderName: string, senderRole: string) => {
    const sender = useStore.getState().users.find(u => u.name === senderName)
    return {
      department: sender?.department || 'N/A',
      role: senderRole,
      sender: sender
    }
  }

  const handleAcknowledge = (messageId: number) => {
    if (currentUser) {
      acknowledgeMessage(messageId, currentUser.id)
    }
  }

  const isAcknowledged = (message: Message) => {
    return currentUser && message.acknowledged_by?.includes(currentUser.id)
  }

  const isMessageRead = (message: Message) => {
    return currentUser && message.read_by?.includes(currentUser.id)
  }

  const shouldShowUnacknowledgedHighlight = (message: Message) => {
    if (isAcknowledged(message)) return false

    // Students and staff should see highlight
    if (currentUser?.role === 'student' || currentUser?.role === 'staff') return true

    // Admins should see highlight only for messages from staff
    if (currentUser?.role === 'admin' && message.sender_role === 'staff') return true

    return false
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Message Feed</h2>
        <div className="text-sm text-gray-500">
          {filteredMessages.length > 0 ? `${filteredMessages.length} of ${visibleMessages.length}` : `${visibleMessages.length}`} message{visibleMessages.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search and Filter Component */}
      <MessageSearchFilter messages={visibleMessages} onFiltered={setFilteredMessages} />

      {filteredMessages.length === 0 ? (
        visibleMessages.length === 0 ? (
          <EmptyState type="no_messages" />
        ) : (
          <EmptyState
            type="no_results"
            onReset={() => {
              setFilteredMessages(visibleMessages)
            }}
          />
        )
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message, idx) => (
            <Card
              key={message.id}
              className={`hover:shadow-md transition-all cursor-pointer animate-slideUp delay-${Math.min(idx, 12)} border-l-4 ${getPriorityBorderColor(message.priority)} ${getPriorityBgColor(message.priority)} ${isMessageRead(message) ? 'opacity-75' : ''} ${shouldShowUnacknowledgedHighlight(message) ? 'ring-2 ring-yellow-400 dark:ring-yellow-600 bg-yellow-100 dark:bg-yellow-900/40' : ''}`}
              onClick={() => {
                onSelectMessage(message.id)
                if (!isMessageRead(message)) {
                  markMessageAsRead(message.id)
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {!isMessageRead(message) && (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full" title="Unread message" aria-label="Unread message"></div>
                        </div>
                      )}
                      <CardTitle className={`text-lg ${!isMessageRead(message) ? 'font-bold' : 'font-semibold'}`}>
                        {message.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{message.sender}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(message.created_at || '')}</span>
                      </div>
                      {isMessageRead(message) && (
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <span title="Message read">✓ Read</span>
                        </div>
                      )}
                    </div>
                    {/* Sender Details with Department and Role Badge */}
                    <div className="flex items-center space-x-3">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Department: <span className="font-semibold text-gray-700 dark:text-gray-300">{getSenderDetails(message.sender, message.sender_role).department}</span>
                      </div>
                      <Badge className={`text-xs font-semibold border ${getRoleColor(message.sender_role)}`}>
                        {message.sender_role.charAt(0).toUpperCase() + message.sender_role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(message.priority)}>
                      {message.priority}
                    </Badge>
                    {isAcknowledged(message) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      // Highlight unacknowledged messages with a small badge
                      shouldShowUnacknowledgedHighlight(message) && (
                        <Badge variant="outline" className="text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700">
                          Needs Acknowledgement
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {message.content}
                </p>
                <div className="flex items-center justify-between">
                  {/* Hide recipient/read/acknowledged stats from students */}
                  {(currentUser?.role === 'admin' || currentUser?.role === 'staff') && (
                    <div className="text-sm text-gray-500">
                      {message.total_recipients} recipient{message.total_recipients !== 1 ? 's' : ''} •
                      {message.read_count} read •
                      {message.acknowledged_by?.length || 0} acknowledged
                    </div>
                  )}
                  {currentUser?.role === 'student' && (
                    <div></div>
                  )}
                  <div className="flex space-x-2">
                    {/* Acknowledge button moved to the Message Details view only */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectMessage(message.id)}
                    >
                      View Details
                    </Button>
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
