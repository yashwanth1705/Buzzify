'use client'

import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { User as UserIcon, Clock, Download, CheckCircle, Users, ArrowLeft } from 'lucide-react'
import { User, Comment } from '@/lib/supabase'

interface MessageDetailProps {
  messageId: number
  onBack: () => void
}

interface CommentFormProps {
  currentUser: User | null
  messageId: number
  addComment: (comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) => Promise<Comment | null>
  replyingTo: Comment | null
  onCancelReply: () => void
  onSuccess?: (comment: Comment | null) => void
}

function CommentForm({ currentUser, messageId, addComment, replyingTo, onCancelReply, onSuccess }: CommentFormProps) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyingTo])

  const handleSubmit = async () => {
    if (!currentUser || !text.trim()) return
    setSubmitting(true)
    try {
      const created = await addComment({
        message_id: messageId,
        parent_comment_id: replyingTo?.id || null,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_email: currentUser.email,
        user_role: currentUser.role,
        user_department: currentUser.department,
        content: text.trim(),
      })
      setText('')
      if (onSuccess) onSuccess(created)
    } catch (err) {
      console.error('Failed to add comment', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded border-l-4 border-indigo-500">
          <div className="text-sm overflow-hidden">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Replying to {replyingTo.user_name}</span>
            <p className="text-gray-500 dark:text-gray-400 truncate">{replyingTo.content}</p>
          </div>
          <button onClick={onCancelReply} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <span className="sr-only">Cancel reply</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 rounded border bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
          rows={replyingTo ? 2 : 1}
          placeholder={currentUser ? 'Type a message...' : 'Log in to comment'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!currentUser || submitting || !text.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center min-w-[3rem]"
        >
          {submitting ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default function MessageDetail({ messageId, onBack }: MessageDetailProps) {
  const { messages, currentUser, acknowledgeMessage, markMessageAsRead, isDarkMode, comments, fetchComments, addComment, deleteComment, markNotificationsAsReadForMessage } = useStore()
  const hasMarkedAsRead = useRef(false)
  const [acknowledgeAnimating, setAcknowledgeAnimating] = useState(false)
  const [showRecipients, setShowRecipients] = useState(false)

  const message = messages.find(m => m.id === messageId)

  // Mark as read when viewing
  useEffect(() => {
    if (currentUser && message && !hasMarkedAsRead.current) {
      hasMarkedAsRead.current = true
      markMessageAsRead(messageId)
      // mark notifications for this message as read
      try { markNotificationsAsReadForMessage(messageId) } catch { /* noop */ }
    }
    // load comments for messages
    fetchComments()
  }, [currentUser, message, messageId, markMessageAsRead, fetchComments, markNotificationsAsReadForMessage])

  // Flat comment list sorted by date
  const commentsForMessage = comments
    .filter((c: Comment) => c.message_id === messageId)
    .sort((a: Comment, b: Comment) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())

  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)

  const getParentComment = (parentId: number) => {
    return comments.find((c: Comment) => c.id === parentId)
  }

  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Scroll chat to bottom when comments change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [commentsForMessage.length])

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

  // Compute recipient users for this message (admin/staff only view)
  const recipientUsers = (() => {
    try {
      const state = useStore.getState()
      const allUsers = state.users || []
      const groups = state.groups || []

      if (message.recipients === 'all') {
        return allUsers
      }
      if (message.recipients === 'students') {
        return allUsers.filter(u => u.role === 'student')
      }
      if (message.recipients === 'staff') {
        return allUsers.filter(u => u.role === 'staff')
      }
      if (message.recipients === 'admins') {
        return allUsers.filter(u => u.role === 'admin')
      }
      if ((message.recipients === 'group' || message.custom_groups) && message.custom_groups?.length) {
        const targetEmails = new Set<string>()
        message.custom_groups.forEach((groupId: number) => {
          const g = groups.find(gr => gr.id === groupId)
          if (g && g.members) {
            g.members.forEach((email: string) => targetEmails.add(email))
          }
        })
        return allUsers.filter(u => targetEmails.has(u.email))
      }
      return []
    } catch (e) {
      console.error('Error computing recipient users:', e)
      return []
    }
  })()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
                  <UserIcon className="h-4 w-4" />
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

          {/* Comments Section */}
          <div>
            <h3 className="font-semibold mb-2">Comments</h3>
            <div className={`flex flex-col h-[500px] rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
                {commentsForMessage.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <p>No comments yet</p>
                    <p className="text-sm">Be the first to start the conversation</p>
                  </div>
                ) : (
                  commentsForMessage.map((comment: Comment) => {
                    const isMe = currentUser?.id === comment.user_id
                    const parent = comment.parent_comment_id ? getParentComment(comment.parent_comment_id) : null

                    return (
                      <div key={comment.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm relative group ${isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none'
                          }`}>
                          {/* Reply Quote */}
                          {parent && (
                            <div className={`mb-2 text-xs p-2 rounded border-l-2 cursor-pointer ${isMe
                              ? 'bg-indigo-700/50 border-indigo-300 text-indigo-100'
                              : 'bg-gray-100 dark:bg-gray-700 border-indigo-500 text-gray-600 dark:text-gray-300'
                              }`}>
                              <div className="font-semibold">{parent.user_name}</div>
                              <div className="truncate opacity-80">{parent.content}</div>
                            </div>
                          )}

                          {/* Header (Name & Role) - Only show for others */}
                          {!isMe && (
                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                              {comment.user_name} <span className="font-normal opacity-75">· {comment.user_role} {comment.user_department ? `· ${comment.user_department}` : ''}</span>
                            </div>
                          )}

                          {/* Content */}
                          <div className="text-sm whitespace-pre-wrap break-words">{comment.content}</div>

                          {/* Footer (Time & Actions) */}
                          <div className={`flex items-center justify-end gap-2 mt-1 text-[10px] ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                            <span>{new Date(comment.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                            {/* Hover Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 ml-2">
                              <button
                                onClick={() => setReplyingTo(comment)}
                                className="hover:underline font-medium"
                              >
                                Reply
                              </button>
                              {isMe && (
                                <button
                                  onClick={() => deleteComment(comment.id)}
                                  className="hover:underline text-red-300 hover:text-red-100"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}

              </div>

              {/* Input Area */}
              <div className={`p-3 border-t ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                <CommentForm
                  currentUser={currentUser}
                  messageId={messageId}
                  addComment={addComment}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                  onSuccess={() => setReplyingTo(null)}
                />
              </div>
            </div>
          </div>

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
              {/* Recipients list (admin/staff) */}
              <div className="mt-4">
                <Button size="sm" variant="ghost" onClick={() => setShowRecipients(!showRecipients)}>
                  {showRecipients ? 'Hide Recipients' : 'View Recipients'}
                </Button>
                {showRecipients && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-auto">
                    {recipientUsers.length === 0 ? (
                      <p className="text-sm text-gray-500">No recipients found</p>
                    ) : (
                      recipientUsers.map((u: User) => (
                        <div key={u.id} className={`p-2 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{u.name}</div>
                              <div className="text-xs text-gray-400">{u.email} · {u.role}</div>
                            </div>
                            <Badge className="text-xs">{u.department || ''}</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {((currentUser?.role === 'student' || currentUser?.role === 'staff' || (currentUser?.role === 'admin' && message.sender_role === 'staff')) && message.sender !== currentUser?.name) && (
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
