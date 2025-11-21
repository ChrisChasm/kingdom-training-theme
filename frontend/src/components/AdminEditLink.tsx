import { useEffect, useState } from 'react';
import { Edit } from 'lucide-react';
import { getCurrentUser, User } from '@/lib/auth';

interface AdminEditLinkProps {
  postId: number;
}

/**
 * AdminEditLink Component
 * Shows an edit icon link to WordPress admin for logged-in administrators and editors
 */
export default function AdminEditLink({ postId }: AdminEditLinkProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AdminEditLink - Component mounted, postId:', postId);
    async function checkUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        // Debug logging - remove in production
        if (currentUser) {
          console.log('AdminEditLink - User:', currentUser);
          console.log('AdminEditLink - Roles:', currentUser.roles);
          console.log('AdminEditLink - Capabilities:', currentUser.capabilities);
        } else {
          console.log('AdminEditLink - No user returned from getCurrentUser()');
        }
      } catch (error) {
        console.error('AdminEditLink - Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, [postId]);

  // Don't show anything while loading or if user is not logged in
  if (loading || !user) {
    return null;
  }

  // Check if user has edit capabilities
  // First check roles (simpler and more reliable)
  // Then check capabilities as fallback
  const hasEditCapability = (() => {
    // Check roles first (administrator or editor)
    if (user.roles && Array.isArray(user.roles)) {
      const hasRole = user.roles.includes('administrator') || user.roles.includes('editor');
      if (hasRole) {
        console.log('AdminEditLink - User has editor/administrator role');
        return true;
      }
    }

    // Fallback to capabilities check
    if (!user.capabilities) {
      console.log('AdminEditLink - No capabilities found');
      return false;
    }

    // Handle both array and object formats
    if (Array.isArray(user.capabilities)) {
      // If it's an array, check if it includes edit capabilities
      const hasCap = user.capabilities.includes('edit_posts') || 
                     user.capabilities.includes('edit_others_posts') ||
                     user.capabilities.includes('administrator');
      console.log('AdminEditLink - Array capabilities check:', hasCap);
      return hasCap;
    } else if (typeof user.capabilities === 'object' && user.capabilities !== null) {
      // If it's an object (associative array from PHP), check for keys
      const caps = user.capabilities as Record<string, boolean | string | number>;
      
      // Check for various capability indicators
      const hasCap = 
        caps.edit_posts === true || 
        caps.edit_others_posts === true ||
        caps.administrator === true ||
        caps.edit_posts === 1 ||
        caps.edit_others_posts === 1 ||
        caps.administrator === 1 ||
        caps.edit_posts === '1' ||
        caps.edit_others_posts === '1' ||
        caps.administrator === '1' ||
        // Also check for level_10 (administrator level)
        caps.level_10 === true ||
        caps.level_10 === 1 ||
        caps.level_10 === '1' ||
        // Check for role-based capabilities
        Object.keys(caps).some(key => 
          key === 'administrator' || 
          key === 'editor' ||
          (key.startsWith('edit_') && caps[key])
        );
      
      console.log('AdminEditLink - Object capabilities check:', hasCap, 'Keys:', Object.keys(caps));
      return hasCap;
    }

    console.log('AdminEditLink - Capabilities format not recognized');
    return false;
  })();

  // Don't show if user doesn't have edit capability
  if (!hasEditCapability) {
    return null;
  }

  // Build WordPress admin edit URL
  // WordPress uses the same edit URL format for all post types
  const editUrl = `/wp-admin/post.php?post=${postId}&action=edit`;

  return (
    <a
      href={editUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-20 right-4 z-50 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200 hover:border-primary-500 group"
      title="Edit in WordPress Admin"
      aria-label="Edit in WordPress Admin"
    >
      <Edit className="w-5 h-5 text-gray-600 group-hover:text-primary-500 transition-colors duration-200" />
    </a>
  );
}

