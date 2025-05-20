// src/utils/avatarUrl.js
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "http://localhost:5000";

export function getAvatarUrl(avatarPath) {
  if (!avatarPath) return "/default-avatar.jpg";
  if (avatarPath.startsWith("http")) return avatarPath;
  // Ensure path starts with /
  const normalized = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;
  return `${API_BASE}${normalized}`;
}