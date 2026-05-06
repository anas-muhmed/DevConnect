import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, MessageCircle, ThumbsUp, UserPlus, AtSign, FileText, Clock } from 'lucide-react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { getAvatarUrl, getInitials, getAvatarColor } from '../utils/avatarUrl';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axiosInstance.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      const wasUnread = notifications.find(n => n._id === notificationId && !n.isRead);
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  const iconMap = {
    like:    { icon: ThumbsUp,      color: 'var(--error)' },
    comment: { icon: MessageCircle, color: '#3B82F6' },
    follow:  { icon: UserPlus,      color: 'var(--success)' },
    mention: { icon: AtSign,        color: '#8B5CF6' },
    post:    { icon: FileText,      color: '#F59E0B' },
  };

  const getNotificationIcon = (type) => {
    const entry = iconMap[type];
    if (!entry) return <Bell size={14} style={{ color: 'var(--text-tertiary)' }} />;
    const Icon = entry.icon;
    return <Icon size={14} style={{ color: entry.color }} />;
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative', padding: '8px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', transition: 'color var(--transition-fast)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            backgroundColor: 'var(--error)', color: '#fff',
            fontSize: '10px', fontWeight: 700,
            borderRadius: 'var(--radius-full)',
            minWidth: '18px', height: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />

          {/* Dropdown panel */}
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: '380px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            zIndex: 50,
            maxHeight: '480px',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>

            {/* Header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Notifications {unreadCount > 0 && (
                  <span style={{
                    marginLeft: '6px', fontSize: '11px', fontWeight: 700,
                    backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)',
                    padding: '2px 7px', borderRadius: 'var(--radius-full)',
                  }}>{unreadCount}</span>
                )}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{ fontSize: '12px', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}
                  >
                    <Check size={13} /> Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-tertiary)', padding: '2px' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <Bell size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px' }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const senderName = notif.sender?.username || 'Someone';
                  const senderAvatarUrl = getAvatarUrl(notif.sender?.profilePicture);
                  const initials = getInitials(senderName);
                  const avatarColor = getAvatarColor(senderName);

                  return (
                    <div
                      key={notif._id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-color-light)',
                        backgroundColor: !notif.isRead ? 'var(--accent-light)' : 'transparent',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = !notif.isRead ? 'var(--accent-light)' : 'transparent'}
                    >
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        {/* Avatar */}
                        <Link to={`/profile/${notif.sender?.username}`} style={{ flexShrink: 0 }}>
                          {senderAvatarUrl ? (
                            <img src={senderAvatarUrl} alt={senderName}
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              backgroundColor: avatarColor,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '12px', fontWeight: 600,
                            }}>{initials}</div>
                          )}
                        </Link>

                        {/* Text content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle', marginRight: '4px' }}>
                                {getNotificationIcon(notif.type)}
                              </span>
                              <Link to={`/profile/${notif.sender?.username}`}
                                style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {senderName}
                              </Link>{' '}
                              {notif.message}
                            </p>
                            <button onClick={() => deleteNotification(notif._id)}
                              style={{ color: 'var(--text-tertiary)', flexShrink: 0, padding: '2px' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {notif.post?.title && (
                            <Link to={`/posts/${notif.post._id}`} style={{
                              display: 'block', marginTop: '3px',
                              fontSize: '12px', color: 'var(--accent-color)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              "{notif.post.title}"
                            </Link>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} /> {moment(notif.createdAt).fromNow()}
                            </span>
                            {!notif.isRead && (
                              <button onClick={() => markAsRead(notif._id)}
                                style={{ fontSize: '11px', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
                                <Check size={11} /> Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: '10px 16px',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'center',
              }}>
                <Link to="/notifications" onClick={() => setIsOpen(false)}
                  style={{ fontSize: '13px', color: 'var(--accent-color)', fontWeight: 500 }}>
                  View all notifications →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
