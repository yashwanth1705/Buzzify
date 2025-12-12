'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { sendNotificationEmail } from '@/app/actions/email'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User } from '@/lib/supabase'
import { FileText, Upload, X, Users, Eye, AlertCircle, CheckCircle, Calendar, Zap } from 'lucide-react'

interface CreateMessageProps {
  onSuccess: () => void
}

export default function CreateMessage({ onSuccess }: CreateMessageProps) {
  const { currentUser, users, groups, addMessage } = useStore()
  const [activeTab, setActiveTab] = useState('message')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    recipients: 'all' as 'all' | 'students' | 'staff' | 'admins' | 'group' | 'manual' | 'department_staff',
    customGroups: [] as number[],
    manualEmails: '',
    scheduleType: 'now' as 'now' | 'later',
    scheduleDate: '',
    scheduleTime: '',
  })
  const [attachments, setAttachments] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRecipientList, setShowRecipientList] = useState(false)

  useEffect(() => {
    if (currentUser?.role === 'student') {
      setFormData(prev => ({ ...prev, recipients: 'department_staff' }))
      setShowRecipientList(true)
    }
  }, [currentUser])



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !formData.title.trim() || !formData.content.trim()) return

    setIsSubmitting(true)
    try {
      let recipientUsers: User[] = []
      let totalRecipients = 0

      if (formData.recipients === 'all') {
        recipientUsers = users.filter(u => u.id !== currentUser.id)
        totalRecipients = recipientUsers.length
      } else if (formData.recipients === 'students') {
        recipientUsers = users.filter(u => u.role === 'student')
        totalRecipients = recipientUsers.length
      } else if (formData.recipients === 'staff') {
        recipientUsers = users.filter(u => u.role === 'staff')
        totalRecipients = recipientUsers.length
      } else if (formData.recipients === 'admins') {
        recipientUsers = users.filter(u => u.role === 'admin')
        totalRecipients = recipientUsers.length
      } else if (formData.recipients === 'department_staff') {
        recipientUsers = users.filter((u) => u.role === 'staff' && u.department === currentUser.department)
        totalRecipients = recipientUsers.length
      }

      if (formData.customGroups.length > 0) {
        formData.customGroups.forEach(groupId => {
          const group = groups.find(g => g.id === groupId)
          if (group) {
            totalRecipients += group.members.length
          }
        })
      }

      const manualEmailsList = formData.recipients === 'manual'
        ? formData.manualEmails.split(',').map(e => e.trim()).filter(e => e)
        : []

      if (formData.recipients === 'manual') {
        totalRecipients = manualEmailsList.length
      }

      const messageData = {
        title: formData.title,
        content: formData.content,
        sender: currentUser.name,
        sender_role: currentUser.role,
        recipients: formData.recipients,
        custom_groups: formData.customGroups,
        manual_recipients: manualEmailsList,
        priority: formData.priority,
        attachments: attachments,
        schedule_type: formData.scheduleType,
        schedule_date: formData.scheduleDate || undefined,
        schedule_time: formData.scheduleTime || undefined,
        total_recipients: totalRecipients,
        read_count: 0,
        acknowledged: false,
        acknowledged_by: [],
      }

      console.log('[CreateMessage] Calling addMessage...')
      const newMessage = await addMessage(messageData)
      console.log('[CreateMessage] addMessage result:', newMessage)

      if (newMessage && newMessage.id) {
        console.log('[CreateMessage] Triggering sendNotificationEmail for ID:', newMessage.id)
        const emailResult = await sendNotificationEmail(
          newMessage.id,
          formData.title,
          formData.content,
          currentUser.name,
          formData.priority,
          formData.recipients,
          formData.customGroups,
          manualEmailsList
        )
        console.log('[CreateMessage] Email Action Result:', emailResult)
      } else {
        console.warn('[CreateMessage] newMessage is missing or has no ID, skipping email')
      }

      setIsSubmitting(false)
      onSuccess()
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newAttachments = Array.from(files).map(file => file.name)
      setAttachments([...attachments, ...newAttachments])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const getRecipientCount = () => {
    let count = 0
    if (formData.recipients === 'all') {
      count = users.filter(u => u.id !== currentUser?.id).length
    } else if (formData.recipients === 'students') {
      count = users.filter(u => u.role === 'student').length
    } else if (formData.recipients === 'staff') {
      count = users.filter(u => u.role === 'staff').length
    } else if (formData.recipients === 'admins') {
      count = users.filter(u => u.role === 'admin').length
    } else if (formData.recipients === 'group') {
      count = 0
    } else if (formData.recipients === 'department_staff') {
      count = users.filter((u) => u.role === 'staff' && u.department === currentUser?.department).length
    }

    formData.customGroups.forEach(groupId => {
      const group = groups.find(g => g.id === groupId)
      if (group) {
        count += group.members.length
      }
    })



    if (formData.recipients === 'manual') {
      const emails = formData.manualEmails.split(',').map(e => e.trim()).filter(e => e)
      count = emails.length
    }

    return count
  }

  const getRecipientEmails = () => {
    if (!currentUser) return [] as string[]
    let emails: string[] = []

    if (formData.recipients === 'all') {
      emails = users.filter(u => u.id !== currentUser.id).map(u => u.email)
    } else if (formData.recipients === 'students') {
      emails = users.filter(u => u.role === 'student').map(u => u.email)
    } else if (formData.recipients === 'staff') {
      emails = users.filter(u => u.role === 'staff').map(u => u.email)
    } else if (formData.recipients === 'admins') {
      emails = users.filter(u => u.role === 'admin').map(u => u.email)
    } else if (formData.recipients === 'group') {
      emails = []
    } else if (formData.recipients === 'department_staff') {
      emails = users
        .filter((u) => u.role === 'staff' && u.department === currentUser.department)
        .map((u) => u.email)
    }

    formData.customGroups.forEach(groupId => {
      const group = groups.find(g => g.id === groupId)
      if (group && Array.isArray(group.members)) {
        group.members.forEach((m: string) => {
          if (!emails.includes(m)) emails.push(m)
        })
      }
    })



    if (formData.recipients === 'manual') {
      const emails = formData.manualEmails.split(',').map(e => e.trim()).filter(e => e)
      emails.forEach(e => {
        if (!emails.includes(e)) emails.push(e)
      })
      return emails // Just return the manual list
    }

    return emails
  }

  const isFormValid = formData.title.trim() && formData.content.trim() && getRecipientCount() > 0

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-3xl font-bold">Create New Message</h2>
        <p className="text-sm text-gray-500 mt-1">Compose and send messages to campus members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="space-y-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start rounded-b-none border-b">
                <TabsTrigger value="message">Message</TabsTrigger>
                <TabsTrigger value="recipients">Recipients</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
              </TabsList>

              {/* Message Tab */}
              <TabsContent value="message" className="space-y-4 p-6 border rounded-b-lg bg-white dark:bg-gray-900">
                <div>
                  <label className="block text-sm font-semibold mb-2">Message Title <span className="text-red-500">*</span></label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Exam Schedule Released"
                    className="text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">A clear, concise subject line</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold">Message Content <span className="text-red-500">*</span></label>
                    <span className="text-xs text-gray-500">{formData.content.length}/500</span>
                  </div>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value.slice(0, 500) })}
                    placeholder="Type your message here..."
                    rows={8}
                    className="text-base resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Priority Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'low', label: 'Low', color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' },
                      { value: 'medium', label: 'Medium', color: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300' },
                      { value: 'high', label: 'High', color: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' }
                    ].map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: priority.value as 'low' | 'medium' | 'high' })}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.priority === priority.value
                          ? priority.color + ' border-2'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600'
                          }`}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Recipients Tab */}
              <TabsContent value="recipients" className="space-y-4 p-6 border rounded-b-lg bg-white dark:bg-gray-900">
                <div>
                  <label className="block text-sm font-semibold mb-3">Select Recipients <span className="text-red-500">*</span></label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Campus Members', desc: 'Everyone except you', hideFor: ['student'] },
                      { value: 'students', label: 'Students Only', desc: 'All students', hideFor: ['student'] },
                      { value: 'staff', label: 'Staff Only', desc: 'All staff members', hideFor: ['staff', 'student'] },
                      { value: 'admins', label: 'Admins Only', desc: 'All administrators', hideFor: ['admin', 'student'] },
                      { value: 'group', label: 'Specific Groups', desc: 'Select custom groups', hideFor: ['student'] },
                      { value: 'manual', label: 'Specific Emails', desc: 'Enter email addresses manually', hideFor: ['student'] },
                      { value: 'department_staff', label: 'Department Staff', desc: `Staff in ${currentUser?.department || 'your department'}`, hideFor: ['admin', 'staff'] }
                    ]
                      .filter(option => !option.hideFor?.includes(currentUser?.role || ''))
                      .map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.recipients === option.value
                            ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400'
                            : 'bg-white border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                        >
                          <input
                            type="radio"
                            name="recipients"
                            value={option.value}
                            checked={formData.recipients === option.value}
                            onChange={(e) => {
                              const val = e.target.value as 'all' | 'students' | 'staff' | 'admins' | 'group' | 'manual' | 'department_staff'
                              setFormData((prev) => ({
                                ...prev,
                                recipients: val,
                                customGroups: [], // Reset custom groups when changing recipient type
                              }))
                              if (val === 'department_staff') {
                                setShowRecipientList(true)
                              }
                            }}
                            className="mt-1"
                          />
                          <div>
                            <p className="text-sm font-medium">{option.label}</p>
                            <p className="text-xs text-gray-500">{option.desc}</p>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>

                {currentUser?.role === 'admin' && groups.length > 0 && formData.recipients === 'group' && (
                  <div>
                    <label className="block text-sm font-semibold mb-3">Custom Groups</label>
                    <div className="border rounded-lg p-3 max-h-56 overflow-y-auto bg-gray-50 dark:bg-gray-800 space-y-2">
                      {groups.map((group) => (
                        <label key={group.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white dark:hover:bg-gray-700 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.customGroups.includes(group.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, customGroups: [...formData.customGroups, group.id] })
                              } else {
                                setFormData({ ...formData, customGroups: formData.customGroups.filter(id => id !== group.id) })
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{group.name}</span>
                          <span className="text-xs text-gray-500">({group.members?.length || 0} members)</span>
                        </label>
                      ))}
                    </div>
                    {formData.customGroups.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.customGroups.map(groupId => {
                          const group = groups.find(g => g.id === groupId)
                          return group ? (
                            <Badge key={groupId} className="animate-fadeIn">
                              {group.name}
                              <button
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  customGroups: formData.customGroups.filter(id => id !== groupId)
                                })}
                                className="ml-2 hover:opacity-75"
                              >
                                ×
                              </button>
                            </Badge>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>
                )}

                {formData.recipients === 'manual' && (
                  <div>
                    <label className="block text-sm font-semibold mb-3">Enter Email Addresses</label>
                    <Textarea
                      placeholder="e.g. user1@example.com, user2@example.com"
                      value={formData.manualEmails}
                      onChange={(e) => setFormData({ ...formData, manualEmails: e.target.value })}
                      className="text-base"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg flex space-x-2">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      <strong>{getRecipientCount()}</strong> recipient{getRecipientCount() !== 1 ? 's' : ''} will receive this message
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      className="text-blue-600 dark:text-blue-400 h-auto p-0 mt-1"
                      onClick={() => setShowRecipientList(!showRecipientList)}
                    >
                      {showRecipientList ? 'Hide' : 'Show'} recipient list
                    </Button>
                    {showRecipientList && (
                      <div className="mt-2 max-h-32 overflow-y-auto bg-white dark:bg-gray-900 border rounded p-2 text-xs space-y-1">
                        {getRecipientEmails().map(email => (
                          <div key={email} className="text-gray-700 dark:text-gray-300">{email}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-4 p-6 border rounded-b-lg bg-white dark:bg-gray-900">
                <div>
                  <label className="block text-sm font-semibold mb-3">Delivery Time</label>
                  <div className="space-y-2">
                    {[
                      { value: 'now', label: 'Send Immediately', icon: Zap },
                      { value: 'later', label: 'Schedule for Later', icon: Calendar }
                    ].map((option) => {
                      const Icon = option.icon
                      return (
                        <label
                          key={option.value}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.scheduleType === option.value
                            ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400'
                            : 'bg-white border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                        >
                          <input
                            type="radio"
                            name="schedule"
                            value={option.value}
                            checked={formData.scheduleType === option.value}
                            onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value as 'now' | 'later' })}
                          />
                          <Icon className="h-5 w-5 text-gray-600" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {formData.scheduleType === 'later' && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Date</label>
                      <Input
                        type="date"
                        value={formData.scheduleDate}
                        onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Time</label>
                      <Input
                        type="time"
                        value={formData.scheduleTime}
                        onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Attachments Tab */}
              <TabsContent value="attachments" className="space-y-4 p-6 border rounded-b-lg bg-white dark:bg-gray-900">
                <div>
                  <label className="block text-sm font-semibold mb-2">Add Attachments</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC, XLSX, JPG, PNG • Max 10MB per file</p>
                    </label>
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Attached Files ({attachments.length})</p>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{file}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex space-x-3 p-6 border-t bg-gray-50 dark:bg-gray-800 rounded-b-lg">
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className="flex-1">
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Pane */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 card-lift">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title Preview */}
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Subject</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formData.title || '(No title)'}
                </p>
              </div>

              {/* Content Preview */}
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Content</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                  {formData.content || '(No content)'}
                </p>
                {formData.content.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{formData.content.length}/500 characters</p>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                  <Badge variant={
                    formData.priority === 'high' ? 'destructive' :
                      formData.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {formData.priority}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Recipients:</span>
                  <span className="font-semibold">{getRecipientCount()}</span>
                </div>

                {attachments.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Files:</span>
                    <span className="font-semibold">{attachments.length}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Send:</span>
                  <span className="font-semibold">
                    {formData.scheduleType === 'now' ? 'Immediately' : 'Scheduled'}
                  </span>
                </div>
              </div>

              {/* Validation Messages */}
              <div className="space-y-2 pt-4 border-t">
                {!formData.title && (
                  <div className="flex items-start space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">Please enter a title</p>
                  </div>
                )}
                {!formData.content && (
                  <div className="flex items-start space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">Please enter message content</p>
                  </div>
                )}
                {getRecipientCount() === 0 && (
                  <div className="flex items-start space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">Select at least one recipient</p>
                  </div>
                )}
                {isFormValid && (
                  <div className="flex items-start space-x-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-green-800 dark:text-green-200">Message is ready to send</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
