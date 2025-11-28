'use client'

import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, User, Clock, Download, CheckCircle, Users } from 'lucide-react'

interface MessageDetailProps {
  messageId: number
  onBack: () => void
}

export default function MessageDetail({ messageId, onBack }: MessageDetailProps) {
  const { messages, currentUser, acknowledgeMessage, markMessageAsRead, isDarkMode } = useStore()
  const hasMarkedAsRead = useRef(false)
  const [acknowledgeAnimating, setAcknowledgeAnimating] = useState(false)

  const message = messages.find(m => m.id === messageId)

  // Mark as read when viewing
  useEffect(() => {
    if (currentUser && message && !hasMarkedAsRead.current) {
      hasMarkedAsRead.current = true
      markMessageAsRead(messageId)
    }
  }, [currentUser, message, messageId, markMessageAsRead])

  if (!message) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Message not found</p>
        <Button onClick={onBack} className="mt-4">
          Back to Messages
        </Button>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const handleAcknowledge = async () => {
    if (currentUser) {
      setAcknowledgeAnimating(true)
      await acknowledgeMessage(messageId, currentUser.id)
      // Show confirmation animation for 500ms, then fade button
      setTimeout(() => setAcknowledgeAnimating(false), 500)
    }
  }

  const isAcknowledged = () => {
    return currentUser && message.acknowledged_by?.includes(currentUser.id)
  }

  const readRate = message.total_recipients > 0
    ? Math.min(Math.round((message.read_count / message.total_recipients) * 100), 100)
    : 0

  const acknowledgeRate = message.total_recipients > 0
    ? Math.round(((message.acknowledged_by?.length || 0) / message.total_recipients) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Messages
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{message.title}</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{message.sender} ({message.sender_role})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(message.created_at || '')}</span>
                </div>
                <Badge variant={getPriorityColor(message.priority)}>
                  {message.priority} priority
                </Badge>
              </div>
            </div>
            {isAcknowledged() && (
              <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Acknowledged</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Message Content</h3>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Attachments</h3>
              <div className="space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <span className="text-sm">{attachment}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Create a dummy download for demo purposes
                        const element = document.createElement('a')
                        const file = new Blob(['This is a demo file content for ' + attachment], { type: 'text/plain' })
                        element.href = URL.createObjectURL(file)
                        element.download = attachment
                        document.body.appendChild(element)
                        element.click()
                        document.body.removeChild(element)
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(currentUser?.role === 'admin' || currentUser?.role === 'staff') && (
            <div>
              <h3 className="font-semibold mb-2">Message Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <div className="flex items-center space-x-2">
                    <Users className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className="font-medium">Recipients</span>
                  </div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{message.total_recipients}</p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <span className="font-medium">Read</span>
                  </div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{readRate}%</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{message.read_count} people</p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <span className="font-medium">Acknowledged</span>
                  </div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{acknowledgeRate}%</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{message.acknowledged_by?.length || 0} people</p>
                </div>
              </div>
            </div>
          )}

          {(currentUser?.role === 'student' || currentUser?.role === 'staff' || (currentUser?.role === 'admin' && message.sender_role === 'staff')) && (
            <div className="flex justify-center pt-4">
              {!isAcknowledged() && (
                <Button 
                  onClick={handleAcknowledge} 
                  size="lg"
                  className={acknowledgeAnimating ? 'animate-buttonDisappear' : ''}
                  disabled={acknowledgeAnimating}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Acknowledge Message Receipt
                </Button>
              )}
            </div>
          )}
          {acknowledgeAnimating && (
            <div className="fixed inset-0 flex items-start justify-center pointer-events-none">
              <div className="mt-24 animate-fadeIn bg-white/80 dark:bg-gray-800/80 rounded-full p-4 shadow-lg">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
