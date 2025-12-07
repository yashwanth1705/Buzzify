'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, X, FilterIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/lib/store'

interface MessageSearchFilterProps {
  messages: any[]
  onFiltered: (messages: any[]) => void
}

export default function MessageSearchFilter({ messages, onFiltered }: MessageSearchFilterProps) {
  const { users, currentUser, notifications } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    sender: 'all',
    priority: 'all',
    status: 'all',
    sortBy: 'newest'
  })

  const senders = useMemo(() => {
    const uniqueSenders = [...new Set(messages.map(m => m.sender || '').filter(Boolean))]
    return uniqueSenders.sort()
  }, [messages])

  // Compute filtered messages (pure) and call onFiltered in an effect
  const filteredMessages = useMemo(() => {
    let filtered = Array.isArray(messages) ? messages.slice() : []

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(msg =>
        (msg.title || '').toLowerCase().includes(query) ||
        (msg.content || '').toLowerCase().includes(query) ||
        (msg.sender || '').toLowerCase().includes(query)
      )
    }

    // Sender filter
    if (filters.sender && filters.sender !== 'all') {
      filtered = filtered.filter(msg => (msg.sender || '') === filters.sender)
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(msg => msg.priority === filters.priority)
    }

    // Status filter
    if (filters.status !== 'all' && currentUser) {
      if (filters.status === 'unread') {
        filtered = filtered.filter(msg => !msg.read_by?.includes(currentUser.id))
      } else if (filters.status === 'unacknowledged') {
        filtered = filtered.filter(msg => !msg.acknowledged_by?.includes(currentUser.id))
      } else if (filters.status === 'new_comments') {
        // Filter messages that have unread notifications associated with them
        const unreadMsgIds = notifications
          .filter(n => !n.read && n.user_id === currentUser.id)
          .map(n => n.message_id)
        filtered = filtered.filter(msg => unreadMsgIds.includes(msg.id))
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return (+new Date(a?.created_at || 0)) - (+new Date(b?.created_at || 0))
        case 'sender':
          return (a?.sender || '').localeCompare(b?.sender || '')
        case 'title':
          return (a?.title || '').localeCompare(b?.title || '')
        case 'newest':
        default:
          return (+new Date(b?.created_at || 0)) - (+new Date(a?.created_at || 0))
      }
    })

    return filtered
  }, [searchQuery, filters, messages, currentUser, notifications])

  useEffect(() => {
    onFiltered(filteredMessages)
  }, [filteredMessages, onFiltered])

  const hasActiveFilters = searchQuery || (filters.sender && filters.sender !== 'all') || filters.priority !== 'all' || filters.status !== 'all' || filters.sortBy !== 'newest'

  const handleReset = () => {
    setSearchQuery('')
    setFilters({
      sender: 'all',
      priority: 'all',
      status: 'all',
      sortBy: 'newest'
    })
  }

  const statusOptions = [
    { value: 'all', label: 'All Messages' },
    { value: 'unread', label: 'Unread' },
    { value: 'unacknowledged', label: 'Unacknowledged' },
    { value: 'new_comments', label: 'New Comments' },
  ]

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-900">
      <CardContent className="p-4 space-y-4">
        {/* Top Row: Search and Sort */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="w-full md:w-48">
            <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="sender">Sender (A-Z)</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Middle Row: Status Pills (Horizontal Scroll) */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 gap-2 scrollbar-hide">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilters({ ...filters, status: option.value })}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.status === option.value
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Bottom Row: Advanced Filters (Collapsible or Inline) */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filters:</span>
          </div>

          <Select value={filters.sender} onValueChange={(value) => setFilters({ ...filters, sender: value })}>
            <SelectTrigger className="h-8 w-[180px] text-xs bg-transparent border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Sender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Senders</SelectItem>
              {senders.map(sender => (
                <SelectItem key={sender} value={sender}>{sender}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
            <SelectTrigger className="h-8 w-[140px] text-xs bg-transparent border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 ml-auto"
            >
              Reset All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
