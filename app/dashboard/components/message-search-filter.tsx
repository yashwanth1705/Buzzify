'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, X, FilterIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/lib/store'

interface MessageSearchFilterProps {
  messages: any[]
  onFiltered: (messages: any[]) => void
}

export default function MessageSearchFilter({ messages, onFiltered }: MessageSearchFilterProps) {
  const { users } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    sender: 'all',
    priority: 'all',
    status: 'all',
    sortBy: 'newest'
  })
  const [showFilters, setShowFilters] = useState(false)

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
    if (filters.status !== 'all') {
      // Status filtering would need additional data from store
      // For now, we'll skip this as it needs acknowledgement tracking
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
  }, [searchQuery, filters, messages])

  useEffect(() => {
    onFiltered(filteredMessages)
  }, [filteredMessages, onFiltered])

  const hasActiveFilters = searchQuery || (filters.sender && filters.sender !== 'all') || filters.priority !== 'all' || filters.sortBy !== 'newest'

  const handleReset = () => {
    setSearchQuery('')
    setFilters({
      sender: 'all',
      priority: 'all',
      status: 'all',
      sortBy: 'newest'
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by title, content, or sender..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Clear search"
            aria-label="Clear search query"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <FilterIcon className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs">
              {(filters.sender && filters.sender !== 'all' ? 1 : 0) + (filters.priority !== 'all' ? 1 : 0) + (filters.sortBy !== 'newest' ? 1 : 0)}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          {/* Sender Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Sender
            </label>
            <Select value={filters.sender} onValueChange={(value) => setFilters({ ...filters, sender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All senders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All senders</SelectItem>
                {senders.map(sender => (
                  <SelectItem key={sender} value={sender}>
                    {sender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Priority
            </label>
            <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort By
            </label>
            <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="sender">Sender (A-Z)</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              {filters.sender && filters.sender !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Sender: {filters.sender}
                  <button 
                    onClick={() => setFilters({ ...filters, sender: 'all' })}
                    title="Remove sender filter"
                    aria-label="Remove sender filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.priority !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Priority: {filters.priority}
                  <button 
                    onClick={() => setFilters({ ...filters, priority: 'all' })}
                    title="Remove priority filter"
                    aria-label="Remove priority filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.sortBy !== 'newest' && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Sort: {filters.sortBy}
                  <button 
                    onClick={() => setFilters({ ...filters, sortBy: 'newest' })}
                    title="Reset sort order"
                    aria-label="Reset sort order"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
