'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { MessageSquare, User, Clock, CheckCircle } from 'lucide-react'

interface MessageFeedProps {
  onSelectMessage: (messageId: number) => void
}

export default function MessageFeed({ onSelectMessage }: MessageFeedProps) {
  const { messages, currentUser, acknowledgeMessage } = useStore()

  // Filter messages based on user role and recipients
  const getVisibleMessages = () => {
    return messages.filter(message => {
      // Admins see everything
      if (currentUser?.role === 'admin') {
        return true
      }

      // Debug logging
      const isStudent = currentUser?.role === 'student'
      const isStaff = currentUser?.role === 'staff'

      // Check for role-based recipients
      if (message.recipients === 'all') return true
      if (isStudent && (message.recipients === 'students' || message.recipients === 'student')) return true
      if (isStaff && message.recipients === 'staff') return true

      // Allow users to see messages they sent
      if (message.sender === currentUser?.name) return true

      // Check if user is in custom groups
      if (message.custom_groups && message.custom_groups.length > 0) {
        // Check if the current user is a member of any of the message's custom groups
        // We need to find the groups that match the IDs in message.custom_groups
        // and check if the current user's email is in their members list
        const userGroups = useStore.getState().groups.filter(g =>
          message.custom_groups?.includes(g.id) &&
          g.members?.includes(currentUser?.email || '')
        )

        if (userGroups.length > 0) {
          return true
        }
      }

      return false
    }).sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
  }

  const visibleMessages = getVisibleMessages()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const handleAcknowledge = (messageId: number) => {
    if (currentUser) {
      acknowledgeMessage(messageId, currentUser.id)
    }
  }

  const isAcknowledged = (message: any) => {
    return currentUser && message.acknowledged_by?.includes(currentUser.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Message Feed</h2>
        <div className="text-sm text-gray-500">
          {visibleMessages.length} message{visibleMessages.length !== 1 ? 's' : ''}
        </div>
      </div>

      {visibleMessages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500 text-center">
              Messages from your campus will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleMessages.map((message, idx) => (
            <Card
              key={message.id}
              className={`hover:shadow-md transition-shadow cursor-pointer animate-slideUp delay-${Math.min(idx, 12)} ${(currentUser?.role === 'student' || currentUser?.role === 'staff') && !isAcknowledged(message) ? 'ring-2 ring-yellow-200 dark:ring-yellow-700 bg-yellow-50 dark:bg-yellow-900/30' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{message.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{message.sender}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(message.created_at || '')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(message.priority)}>
                      {message.priority}
                    </Badge>
                    {isAcknowledged(message) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      // Highlight unacknowledged messages for students and staff with a small badge
                      (currentUser?.role === 'student' || currentUser?.role === 'staff') && (
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
                  <div className="text-sm text-gray-500">
                    {message.total_recipients} recipient{message.total_recipients !== 1 ? 's' : ''} •
                    {message.read_count} read •
                    {message.acknowledged_by?.length || 0} acknowledged
                  </div>
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
