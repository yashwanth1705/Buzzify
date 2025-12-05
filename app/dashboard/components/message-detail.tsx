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

function CommentForm({ currentUser, messageId, addComment, parentId = null, onSuccess }: any) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!currentUser || !text.trim()) return
    setSubmitting(true)
    try {
      const created = await addComment({
        message_id: messageId,
        parent_comment_id: parentId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_email: currentUser.email,
        user_role: currentUser.role,
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
    <div className="mt-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 rounded border bg-white dark:bg-gray-700 text-sm"
        rows={3}
        placeholder={currentUser ? 'Write a comment...' : 'Log in to comment'}
      />
      <div className="flex justify-end mt-2">
        <button onClick={handleSubmit} disabled={!currentUser || submitting} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">
          Post Comment
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
      try { markNotificationsAsReadForMessage(messageId) } catch (e) { /* noop */ }
    }
    // load comments for messages
    fetchComments()
  }, [currentUser, message, messageId, markMessageAsRead, fetchComments, markNotificationsAsReadForMessage])

  // Build nested comment tree
  const commentsForMessage = comments.filter((c: any) => c.message_id === messageId)

  const buildTree = (list: any[]) => {
    const map = new Map<number, any>()
    const roots: any[] = []
    list.forEach((item) => map.set(item.id, { ...item, children: [] }))
    list.forEach((item) => {
      const node = map.get(item.id)
      if (item.parent_comment_id) {
        const parent = map.get(item.parent_comment_id)
        if (parent) parent.children.push(node)
        else roots.push(node)
      } else {
        roots.push(node)
      }
    })
    return roots
  }

  const commentTree = buildTree(commentsForMessage)

  const [replyTo, setReplyTo] = useState<number | null>(null)

  const renderNode = (node: any, depth = 0) => {
    return (
      <div key={node.id} className="border-b last:border-b-0 pb-2 pl-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium">{node.user_name} <span className="text-xs text-gray-400">· {node.user_role}</span></div>
            <div className="text-xs text-gray-400">{new Date(node.created_at).toLocaleString()}</div>
          </div>
          <div className="text-sm flex items-center gap-2">
            <button className="text-indigo-500 text-xs" onClick={() => setReplyTo(node.id)}>Reply</button>
            {currentUser?.id === node.user_id && (
              <button className="text-red-500 text-xs" onClick={() => deleteComment(node.id)}>Delete</button>
            )}
          </div>
        </div>
        <div className="mt-2 text-sm whitespace-pre-wrap">{node.content}</div>
        {replyTo === node.id && (
          <div className="mt-2">
            <CommentForm currentUser={currentUser} messageId={messageId} addComment={addComment} parentId={node.id} onSuccess={() => setReplyTo(null)} />
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <div className="mt-2 space-y-2">
            {node.children.map((child: any) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

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

  const isMessageRead = () => {
    return currentUser && message.read_by?.includes(currentUser.id)
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

          {/* Comments Section */}
          <div>
            <h3 className="font-semibold mb-2">Comments</h3>
            <div className={`space-y-3 p-3 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              {/* Build a comment tree so replies are nested */}
              {(() => {
                const tree: any[] = []
                const map: Record<string, any> = {}
                comments.filter(c => c.message_id === messageId).forEach((c: any) => {
                  map[c.id] = { ...c, replies: [] }
                })
                Object.values(map).forEach((c: any) => {
                  if (c.parent_comment_id) {
                    const parent = map[c.parent_comment_id]
                    if (parent) parent.replies.push(c)
                    else tree.push(c) // orphaned reply
                  } else {
                    tree.push(c)
                  }
                })

                if (tree.length === 0) return (<p className="text-sm text-gray-500">No comments yet</p>)

                const renderNode = (node: any, depth = 0) => (
                  <div key={node.id} className={`border-b last:border-b-0 pb-2 pl-${Math.min(depth * 4, 12)}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium">{node.user_name} <span className="text-xs text-gray-400">· {node.user_role}</span></div>
                        <div className="text-xs text-gray-400">{new Date(node.created_at).toLocaleString()}</div>
                      </div>
                      <div className="text-sm">
                        {currentUser?.id === node.user_id && (
                          <button className="text-red-500 text-xs" onClick={() => deleteComment(node.id)}>Delete</button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-sm whitespace-pre-wrap">{node.content}</div>
                    <div className="mt-2 text-sm flex space-x-2">
                      <button className="text-blue-500 text-xs" onClick={() => setReplyTo(node.id)}>Reply</button>
                    </div>
                    {replyTo === node.id && (
                      <div className="mt-2">
                        <CommentForm
                          currentUser={currentUser}
                          messageId={messageId}
                          parentId={node.id}
                          addComment={addComment}
                          onSuccess={() => setReplyTo(null)}
                        />
                      </div>
                    )}
                    {node.replies && node.replies.map((r: any) => renderNode(r, depth + 1))}
                  </div>
                )

                return tree.map(n => renderNode(n, 0))
              })()}

              {/* Root comment form */}
              <div className="mt-3">
                <CommentForm
                  currentUser={currentUser}
                  messageId={messageId}
                  addComment={addComment}
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
                      recipientUsers.map((u: any) => (
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
