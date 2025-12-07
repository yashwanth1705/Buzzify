# Integration Guide - New Features Usage

## Quick Reference

### 1. Using the Search & Filter Component

**Already integrated in `message-feed.tsx`**, but here's how to add it elsewhere:

```tsx
import MessageSearchFilter from '@/app/dashboard/components/message-search-filter'

export function MyMessageList() {
  const [filteredMessages, setFilteredMessages] = useState([])
  const messages = useStore().messages

  return (
    <div>
      <MessageSearchFilter 
        messages={messages} 
        onFiltered={setFilteredMessages} 
      />
      {/* Display filteredMessages */}
    </div>
  )
}
```

### 2. Using Toast Notifications

**Wrap your app with ToastProvider** (should be in `app/dashboard/page.tsx` or root layout):

```tsx
import { ToastProvider } from '@/app/dashboard/components/toast-provider'

export default function DashboardLayout() {
  return (
    <ToastProvider>
      {/* Your dashboard content */}
    </ToastProvider>
  )
}
```

**Then use anywhere**:

```tsx
import { useToast } from '@/app/dashboard/components/toast-provider'

function MessageActions() {
  const { addToast } = useToast()

  const handleSend = async () => {
    try {
      await sendMessage()
      addToast('Message sent successfully!', 'success')
    } catch (error) {
      addToast('Failed to send message', 'error', 5000)
    }
  }

  return <button onClick={handleSend}>Send</button>
}
```

**Toast Types & Duration**:
```typescript
// Success (auto-dismiss in 3s)
addToast('Action completed!', 'success')

// Error (auto-dismiss in 5s)
addToast('Something went wrong', 'error', 5000)

// Info (no auto-dismiss)
addToast('Important information', 'info', 0)

// Custom duration (in milliseconds)
addToast('Custom message', 'info', 7000)
```

### 3. Using Empty States

```tsx
import EmptyState from '@/app/dashboard/components/empty-state'

function MessageList() {
  const messages = useStore().messages

  if (messages.length === 0) {
    return <EmptyState type="no_messages" />
  }

  // Different empty states for different scenarios:
  return (
    <>
      {/* No search results */}
      {searchResults.length === 0 && (
        <EmptyState 
          type="no_results" 
          onReset={() => clearFilters()}
        />
      )}

      {/* All messages read */}
      {unreadMessages.length === 0 && (
        <EmptyState type="no_unread" />
      )}

      {/* No scheduled messages */}
      {scheduledMessages.length === 0 && (
        <EmptyState type="no_scheduled" />
      )}
    </>
  )
}
```

### 4. Using Skeleton Loaders

```tsx
import SkeletonLoader from '@/app/dashboard/components/skeleton-loader'

function MessageListWithLoading() {
  const [isLoading, setIsLoading] = useState(true)
  const messages = useStore().messages

  useEffect(() => {
    fetchMessages().then(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <SkeletonLoader count={3} type="message_card" />
  }

  return <MessageList messages={messages} />
}

// For message detail page:
function MessageDetailWithLoading() {
  const [isLoading, setIsLoading] = useState(true)

  if (isLoading) {
    return <SkeletonLoader type="detail" />
  }

  return <MessageDetail />
}

// For notifications dropdown:
function NotificationDropdown() {
  const [isLoading, setIsLoading] = useState(true)

  if (isLoading) {
    return <SkeletonLoader count={5} type="notification" />
  }

  return <NotificationList />
}
```

### 5. Using Read Status Features

**Reading read status**:
```tsx
import { useStore } from '@/lib/store'

function MessageCard({ message }) {
  const currentUser = useStore().currentUser
  
  // Check if current user has read this message
  const isRead = currentUser && message.read_by?.includes(currentUser.id)

  return (
    <div className={isRead ? 'opacity-75' : 'opacity-100'}>
      {/* Message content */}
    </div>
  )
}
```

**Manually marking as read**:
```tsx
import { useStore } from '@/lib/store'

function MessageAction() {
  const { markMessageAsRead } = useStore()

  const handleView = () => {
    markMessageAsRead(messageId) // Auto-marks current user as read
  }

  return <button onClick={handleView}>View Message</button>
}
```

### 6. Priority Color System

**Using priority colors in your components**:

```tsx
function getPriorityStyles(priority: string) {
  const borderColors = {
    high: 'border-l-red-500 dark:border-l-red-400',
    medium: 'border-l-orange-500 dark:border-l-orange-400',
    low: 'border-l-green-500 dark:border-l-green-400'
  }

  const hoverColors = {
    high: 'hover:bg-red-50 dark:hover:bg-red-900/10',
    medium: 'hover:bg-orange-50 dark:hover:bg-orange-900/10',
    low: 'hover:bg-green-50 dark:hover:bg-green-900/10'
  }

  return {
    border: borderColors[priority] || 'border-l-gray-300',
    hover: hoverColors[priority] || ''
  }
}
```

---

## Common Scenarios

### Scenario 1: Complete Message View with All Features

```tsx
'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import MessageSearchFilter from '@/app/dashboard/components/message-search-filter'
import EmptyState from '@/app/dashboard/components/empty-state'
import SkeletonLoader from '@/app/dashboard/components/skeleton-loader'
import { useToast } from '@/app/dashboard/components/toast-provider'

export function CompleteMessageView() {
  const { messages, currentUser, markMessageAsRead } = useStore()
  const { addToast } = useToast()
  const [filteredMessages, setFilteredMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectMessage = (messageId: number) => {
    markMessageAsRead(messageId)
    addToast('Message marked as read', 'info')
  }

  if (isLoading) {
    return <SkeletonLoader count={5} type="message_card" />
  }

  if (messages.length === 0) {
    return <EmptyState type="no_messages" />
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Messages</h2>
      
      {/* Search & Filter */}
      <MessageSearchFilter 
        messages={messages}
        onFiltered={setFilteredMessages}
      />

      {/* Show empty state if no results */}
      {filteredMessages.length === 0 && messages.length > 0 ? (
        <EmptyState 
          type="no_results"
          onReset={() => setFilteredMessages(messages)}
        />
      ) : (
        <div className="space-y-4">
          {filteredMessages.map(message => (
            <MessageCard 
              key={message.id}
              message={message}
              onSelect={() => handleSelectMessage(message.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Scenario 2: Toast Notifications on Actions

```tsx
'use client'

import { useToast } from '@/app/dashboard/components/toast-provider'
import { useStore } from '@/lib/store'

export function MessageActions({ messageId }) {
  const { addToast } = useToast()
  const { acknowledgeMessage, currentUser } = useStore()

  const handleAcknowledge = async () => {
    try {
      if (!currentUser) throw new Error('Not authenticated')
      
      await acknowledgeMessage(messageId, currentUser.id)
      addToast('Message acknowledged!', 'success')
    } catch (error) {
      addToast('Failed to acknowledge message', 'error')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Message ${messageId}`)
    addToast('Message link copied!', 'success', 2000)
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleAcknowledge}>Acknowledge</button>
      <button onClick={handleCopy}>Copy Link</button>
    </div>
  )
}
```

### Scenario 3: Loading States with Transitions

```tsx
'use client'

import { useEffect, useState } from 'react'
import SkeletonLoader from '@/app/dashboard/components/skeleton-loader'

export function MessageListWithLoading() {
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setMessages([
        { id: 1, title: 'Welcome' },
        { id: 2, title: 'Announcement' }
      ])
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="transition-opacity duration-300">
      {isLoading ? (
        <SkeletonLoader count={3} type="message_card" />
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <MessageCard key={msg.id} message={msg} />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Best Practices

### 1. Toast Notifications
✅ DO:
- Use for user feedback on actions
- Show success/error immediately
- Keep messages short and clear
- Use appropriate type (success, error, info)

❌ DON'T:
- Show too many toasts at once (max 3-4)
- Make messages too long
- Use for critical information that needs acknowledgement

### 2. Empty States
✅ DO:
- Show when data is actually empty
- Provide actionable next steps
- Use clear icons and text
- Suggest how to fix the situation

❌ DON'T:
- Leave user guessing why nothing appears
- Show empty states on loading (use skeleton instead)
- Use confusing error messages

### 3. Search & Filter
✅ DO:
- Show number of results
- Allow quick filter removal
- Highlight active filters
- Preserve search state during navigation

❌ DON'T:
- Filter client-side for large datasets (use pagination)
- Hide filter options
- Reset filters on page change

### 4. Skeleton Loaders
✅ DO:
- Match shape/size of real content
- Show multiple skeletons for lists
- Use consistent timing
- Transition smoothly to real content

❌ DON'T:
- Show skeletons for <500ms loads (too fast)
- Use skeleton for errors (show error state)
- Make skeleton look too real (hard to distinguish)

---

## Troubleshooting

### Issue: Toast not showing
**Solution**: Make sure `ToastProvider` wraps your component
```tsx
// ❌ Wrong
<MyComponent />

// ✅ Correct
<ToastProvider>
  <MyComponent />
</ToastProvider>
```

### Issue: Search not filtering in real-time
**Solution**: Make sure `onFiltered` callback is passed correctly
```tsx
<MessageSearchFilter 
  messages={allMessages}
  onFiltered={setFilteredMessages}  // ← Required
/>
```

### Issue: Empty state not showing
**Solution**: Check condition logic
```tsx
// ✅ Correct logic
{filteredMessages.length === 0 && allMessages.length === 0 && (
  <EmptyState type="no_messages" />
)}
```

### Issue: Dark mode colors look wrong
**Solution**: Ensure dark mode utilities are used
```tsx
// ✅ Correct
className="bg-red-500 dark:bg-red-600"

// ❌ Wrong
className="bg-red-500"
```

---

## Performance Tips

1. **Memoize Filtered Results**: Using `useMemo` in SearchFilter for performance
2. **Lazy Load Images**: Avatar images should be lazy loaded
3. **Virtualize Long Lists**: For 1000+ messages, use `react-window`
4. **Debounce Search**: Search already debounced in component
5. **Cache Toast Position**: Fixed positioning is performant

---

## Accessibility Checklist

- ✅ Toast has `role="alert"` and `aria-live="polite"`
- ✅ All buttons have `aria-label` or `title`
- ✅ Empty state icons are decorative (not interactive)
- ✅ Skeleton loaders are hidden from screen readers
- ✅ Search input has proper `label` or `placeholder`
- ✅ Color not the only indicator (text included)
- ✅ Focus states are visible
- ✅ Keyboard navigation works throughout

---

## Future Enhancements

1. **Batch Operations**: Select multiple messages and perform bulk actions
2. **Advanced Filtering**: Date range, multiple senders, custom filters
3. **Message Templates**: Save filters as templates
4. **Analytics**: Show search trends and popular filters
5. **Keyboard Shortcuts**: `Ctrl+F` for search, `/` for filters
6. **Export**: Export filtered messages to CSV
7. **Saved Searches**: Save common filter combinations

---

**All features ready to use! Happy coding! 🚀**
