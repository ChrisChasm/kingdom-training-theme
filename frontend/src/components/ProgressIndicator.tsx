import { useMemo, useState, useEffect } from 'react';
import { getProgressPercentage, getCompletedCount } from '@/lib/utils';

interface ProgressIndicatorProps {
  stepSlugs: string[];
  totalSteps?: number;
  className?: string;
}

export default function ProgressIndicator({ 
  stepSlugs, 
  totalSteps,
  className = '' 
}: ProgressIndicatorProps) {
  // State to force re-render when localStorage changes
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Listen for storage changes (including from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'strategy_course_progress') {
        setUpdateTrigger(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    const handleCustomStorageChange = () => {
      setUpdateTrigger(prev => prev + 1);
    };
    
    window.addEventListener('courseProgressUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('courseProgressUpdated', handleCustomStorageChange);
    };
  }, []);

  const progress = useMemo(() => getProgressPercentage(stepSlugs), [stepSlugs, updateTrigger]);
  const completedCount = useMemo(() => getCompletedCount(stepSlugs), [stepSlugs, updateTrigger]);
  const total = totalSteps || stepSlugs.length;

  const getProgressMessage = () => {
    if (completedCount === 0) {
      return 'Start with Step 1 to begin your M2DMM strategy development journey.';
    } else if (completedCount === total) {
      return 'Congratulations! You\'ve completed all steps in the strategy course.';
    } else {
      return `Keep going! You're making great progress on your M2DMM strategy.`;
    }
  };

  return (
    <div className={`p-6 bg-background-50 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
        <span className="text-sm text-gray-600">
          {completedCount} of {total} steps completed
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-primary-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 mt-3">
        {getProgressMessage()}
      </p>
    </div>
  );
}

