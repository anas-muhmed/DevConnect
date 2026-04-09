// src/utils/avatarUrl.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';
const API_ORIGIN = API_BASE_URL.replace('/api', '');

export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.includes('via.placeholder.com')) return null;

  let normalizedPath = avatarPath.replace(/\\/g, '/');

  if (normalizedPath.startsWith('http://127.0.0.1:5000') || normalizedPath.startsWith('http://localhost:5000')) {
    return normalizedPath
      .replace('http://127.0.0.1:5000', API_ORIGIN)
      .replace('http://localhost:5000', API_ORIGIN);
  }
  if (normalizedPath.startsWith('http')) return normalizedPath;

  normalizedPath = normalizedPath.replace(/^\//, '');
  normalizedPath = normalizedPath.replace(/^uploads\//, '');

  return `${API_ORIGIN}/uploads/${normalizedPath}`;
};

// Generate initials from name (e.g., "John Doe" -> "JD")
export const getInitials = (name) => {
  if (!name) return '?';

  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Generate consistent color based on name (same name = same color)
export const getAvatarColor = (name) => {
  if (!name) return '#6B7280'; // Gray for unknown

  const colors = [
    '#EF4444', // Red
    '#F59E0B', // Orange  
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange-red
  ];

  // Simple hash function to get consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};