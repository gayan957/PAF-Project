import React, { useState } from 'react';
import api from '../../api/axios';
import { Send, Edit2, Trash2, X, Check } from 'lucide-react';

const CommentSection = ({ ticketId }) => {
    const [comments, setComments] = React.useState([]);
    const [newComment, setNewComment] = React.useState('');
    const [editingId, setEditingId] = React.useState(null);
    const [editContent, setEditContent] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState(null);
    const bottomRef = React.useRef(null);

    const fetchComments = React.useCallback(async () => {
        try {
            const response = await api.get(`/tickets/${ticketId}/comments`);
            setComments(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching comments", error);
        }
    }, [ticketId]);

    const fetchCurrentUser = React.useCallback(async () => {
        try {
            const response = await api.get('/auth/me');
            setCurrentUser(response.data);
        } catch (error) {
            console.error("Error fetching current user", error);
        }
    }, []);

    React.useEffect(() => {
        fetchComments();
        fetchCurrentUser();
    }, [fetchComments, fetchCurrentUser]);

    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            await api.post(`/tickets/${ticketId}/comments`, { content: newComment });
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error("Error adding comment", error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment(e);
        }
    };

    const handleUpdateComment = async (id) => {
        if (!editContent.trim()) return;
        try {
            await api.put(`/comments/${id}`, { content: editContent });
            setEditingId(null);
            fetchComments();
        } catch (error) {
            console.error("Error updating comment", error);
        }
    };

    const handleDeleteComment = async (id) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await api.delete(`/comments/${id}`);
            fetchComments();
        } catch (error) {
            console.error("Error deleting comment", error);
        }
    };

    const getRoleLabel = (role) => {
        if (!role) return '';
        if (role === 'ROLE_ADMIN') return 'Admin';
        if (role === 'ROLE_TECHNICIAN') return 'Technician';
        return 'User';
    };

    const getRoleColor = (role) => {
        if (role === 'ROLE_ADMIN') return '#ef4444';
        if (role === 'ROLE_TECHNICIAN') return '#3b82f6';
        return '#10b981';
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div style={{ marginTop: '2.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#0f172a', fontWeight: '700' }}>
                Discussion
                <span style={{ marginLeft: '0.6rem', fontSize: '0.8rem', color: '#64748b', fontWeight: '400' }}>
                    ({comments.length} {comments.length === 1 ? 'message' : 'messages'})
                </span>
            </h3>

            {/* Chat Window */}
            <div style={{
                background: '#f8fafc',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                minHeight: '250px',
                maxHeight: '500px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '1.5rem',
                boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
            }}>
                {comments.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', margin: 'auto' }}>
                        No messages yet. Start the discussion!
                    </div>
                ) : (
                    comments.slice().reverse().map(comment => {
                        const isMine = currentUser && comment.user?.id === currentUser.id;
                        const isEditing = editingId === comment.id;

                        return (
                            <div key={comment.id} style={{
                                display: 'flex',
                                flexDirection: isMine ? 'row-reverse' : 'row',
                                alignItems: 'flex-end',
                                gap: '0.5rem',
                            }}>
                                {/* Avatar */}
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: getRoleColor(comment.user?.role),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    color: '#fff',
                                    flexShrink: 0,
                                }}>
                                    {getInitials(comment.user?.name)}
                                </div>

                                {/* Bubble */}
                                <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                    {/* Name + Role */}
                                    {!isMine && (
                                        <div style={{ fontSize: '0.75rem', display: 'flex', gap: '0.4rem', paddingLeft: '0.25rem' }}>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{comment.user?.name}</span>
                                            {comment.user?.role && (
                                                <span style={{ color: getRoleColor(comment.user.role), fontWeight: '500' }}>
                                                    · {getRoleLabel(comment.user.role)}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Message */}
                                    {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="form-input"
                                                rows="2"
                                                style={{ fontSize: '0.875rem' }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button onClick={() => setEditingId(null)} className="btn btn-outline btn-xs"><X size={12} /></button>
                                                <button onClick={() => handleUpdateComment(comment.id)} className="btn btn-primary btn-xs"><Check size={12} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: isMine ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                                            background: isMine ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#ffffff',
                                            color: isMine ? '#fff' : '#334155',
                                            fontSize: '0.9rem',
                                            lineHeight: '1.5',
                                            wordBreak: 'break-word',
                                            border: isMine ? 'none' : '1px solid #e2e8f0',
                                            boxShadow: isMine ? '0 4px 12px rgba(99,102,241,0.2)' : '0 2px 4px rgba(0,0,0,0.02)'
                                        }}>
                                            {comment.content}
                                        </div>
                                    )}

                                    {/* Timestamp + Actions */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {comment.updatedAt !== comment.createdAt && ' · edited'}
                                        </span>
                                        {currentUser && (currentUser.id === comment.user?.id || currentUser.role === 'ROLE_ADMIN') && !isEditing && (
                                            <>
                                                {currentUser.id === comment.user?.id && (
                                                    <button onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }} className="btn-icon-sm" style={{ padding: '0.1rem' }}>
                                                        <Edit2 size={10} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteComment(comment.id)} className="btn-icon-sm" style={{ padding: '0.1rem', color: 'var(--danger)' }}>
                                                    <Trash2 size={10} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="form-input"
                    rows="1"
                    style={{ 
                        flex: 1, 
                        resize: 'none', 
                        borderRadius: '1.25rem', 
                        padding: '0.75rem 1.25rem', 
                        fontSize: '0.9rem',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        color: '#0f172a',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                />
                <button
                    type="submit"
                    disabled={loading || !newComment.trim()}
                    style={{
                        background: newComment.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9',
                        border: 'none',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                        boxShadow: newComment.trim() ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
                    }}
                >
                    <Send size={18} color={newComment.trim() ? '#fff' : '#94a3b8'} />
                </button>
            </form>
        </div>
    );
};

export default CommentSection;
