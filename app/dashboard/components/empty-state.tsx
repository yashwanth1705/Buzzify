'use client'

import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Search, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  type: 'no_messages' | 'no_results' | 'no_unread' | 'no_scheduled'
  onReset?: () => void
}

export default function EmptyState({ type, onReset }: EmptyStateProps) {
  const states = {
    no_messages: {
      icon: MessageSquare,
      title: 'No messages yet',
      description: 'Messages from your campus will appear here.',
      tips: 'Check back later or ask your instructors to send you messages.',
      showReset: false
    },
    no_results: {
      icon: Search,
      title: 'No results found',
      description: 'Try adjusting your search or filters.',
      tips: 'Clear your filters to see all messages.',
      showReset: true
    },
    no_unread: {
      icon: MessageSquare,
      title: 'All caught up!',
      description: 'You\'ve read all your messages.',
      tips: 'New messages will appear here as they arrive.',
      showReset: false
    },
    no_scheduled: {
      icon: Clock,
      title: 'No scheduled messages',
      description: 'You haven\'t scheduled any messages yet.',
      tips: 'Create a new message and select a future date to schedule it.',
      showReset: false
    }
  }

  const state = states[type]
  const Icon = state.icon

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <Icon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {state.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {state.description}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
            {state.tips}
          </p>
          {state.showReset && onReset && (
            <Button
              variant="outline"
              onClick={onReset}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
