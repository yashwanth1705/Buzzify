'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface SkeletonLoaderProps {
  count?: number
  type?: 'message_card' | 'notification' | 'detail'
}

export default function SkeletonLoader({ count = 3, type = 'message_card' }: SkeletonLoaderProps) {
  const MessageCardSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded ml-4"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const NotificationSkeleton = () => (
    <div className="flex items-start space-x-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
      <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  )

  const DetailSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
      <Card>
        <CardHeader className="space-y-3">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSkeletons = () => {
    const skeletons = []
    for (let i = 0; i < count; i++) {
      if (type === 'message_card') {
        skeletons.push(<MessageCardSkeleton key={i} />)
      } else if (type === 'notification') {
        skeletons.push(<NotificationSkeleton key={i} />)
      } else if (type === 'detail' && i === 0) {
        skeletons.push(<DetailSkeleton key={i} />)
        break
      }
    }
    return skeletons
  }

  return (
    <div className={type === 'notification' ? 'space-y-2' : 'space-y-4'}>
      {renderSkeletons()}
    </div>
  )
}
