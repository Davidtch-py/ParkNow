import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'list' | 'table';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  count = 3, 
  type = 'card' 
}) => {
  if (type === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
