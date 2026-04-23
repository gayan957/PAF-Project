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
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)', fontWeight: '600' }}>
                Discussion
                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                    ({comments.length} {comments.length === 1 ? 'message' : 'messages'})
                </span>
            </h3>

            {/* Chat Window */}
            <div style={{
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
                padding: '1rem',
                minHeight: '200px',
                maxHeight: '400px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1rem'
            }}>
                {comments.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', margin: 'auto' }}>
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
                                        <div style={{ fontSize: '0.7rem', display: 'flex', gap: '0.4rem', paddingLeft: '0.25rem' }}>
                                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{comment.user?.name}</span>
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
                                            padding: '0.6rem 0.85rem',
                                            borderRadius: isMine ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                                            background: isMine ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                                            color: isMine ? '#fff' : 'var(--text-main)',
                                            fontSize: '0.875rem',
                                            lineHeight: '1.5',
                                            wordBreak: 'break-word',
                                            border: isMine ? 'none' : '1px solid var(--border)',
                                        }}>
                                            {comment.content}
                                        </div>
                                    )}

                                    {/* Timestamp + Actions */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
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
                    placeholder="Type a message... (Enter to send)"
                    className="form-input"
                    rows="1"
                    style={{ flex: 1, resize: 'none', borderRadius: '1.5rem', padding: '0.6rem 1rem', fontSize: '0.875rem' }}
                />
                <button
                    type="submit"
                    disabled={loading || !newComment.trim()}
                    style={{
                        background: newComment.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                    }}
                >
                    <Send size={16} color={newComment.trim() ? '#fff' : 'var(--text-muted)'} />
                </button>
            </form>
        </div>
    );
};

export default CommentSection;
