import React from 'react';
import { TrendingUp, Users, Hash, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const RightPanel = () => {
    const trendingTags = [
        { name: 'reactjs', posts: '12.4k' },
        { name: 'javascript', posts: '8.2k' },
        { name: 'frontend', posts: '6.3k' },
        { name: 'systemdesign', posts: '4.1k' },
        { name: 'css', posts: '2.9k' }
    ];

    const suggestedUsers = [
        { username: 'alekstrust', role: 'Staff Engineer', initials: 'AT', color: '#3B82F6' },
        { username: 'sarah_codes', role: 'Frontend Lead', initials: 'SC', color: '#10B981' },
        { username: 'dev_ninja', role: 'Fullstack Dev', initials: 'DN', color: '#8B5CF6' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Create Button */}
            <Link to="/create" className="btn-primary flex-center gap-sm" style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(255, 98, 67, 0.25)' }}>
                <Sparkles size={18} /> Compose New Post
            </Link>

            {/* Trending Section */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <TrendingUp size={18} style={{ color: 'var(--accent-color)' }} /> Trending Topics
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {trendingTags.map((tag, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', padding: '6px', margin: '-6px', borderRadius: '8px' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ backgroundColor: 'var(--bg-main)', padding: '6px', borderRadius: '8px' }}>
                                    <Hash size={14} style={{ color: 'var(--text-tertiary)' }} />
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                    {tag.name}
                                </span>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-tertiary)' }}>
                                {tag.posts}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Suggested Users */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <Users size={18} style={{ color: 'var(--accent-color)' }} /> Who to Follow
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {suggestedUsers.map((user, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    backgroundColor: user.color, color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '14px', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    {user.initials}
                                </div>
                                <div>
                                    <div style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>{user.username}</div>
                                    <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-tertiary)' }}>{user.role}</div>
                                </div>
                            </div>
                            <button style={{
                                padding: '8px', borderRadius: '50%', backgroundColor: 'var(--bg-main)',
                                color: 'var(--accent-color)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-color)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-main)'; e.currentTarget.style.color = 'var(--accent-color)'; }}>
                                <Plus size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Links */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '0 12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', cursor: 'pointer' }}>About</span>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', cursor: 'pointer' }}>Help Center</span>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', cursor: 'pointer' }}>Privacy Policy</span>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', cursor: 'pointer' }}>Terms of Service</span>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', width: '100%', marginTop: '8px' }}>© 2026 DevConnect Inc.</span>
            </div>

        </div>
    );
};

export default RightPanel;
