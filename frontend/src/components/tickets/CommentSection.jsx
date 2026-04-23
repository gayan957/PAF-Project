import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Send, Edit2, Trash2, X, Check } from 'lucide-react';

const CommentSection = ({ ticketId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const fetchComments = React.useCallback(async () => {
        try {
            const response = await api.get(`/tickets/${ticketId}/comments`);
            setComments(response.data);
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

    useEffect(() => {
        fetchComments();
        fetchCurrentUser();
    }, [fetchComments, fetchCurrentUser]);

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

    return (
        <div className="comment-section" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Discussion</h3>
            
            <form onSubmit={handleAddComment} className="comment-form" style={{ marginBottom: '2rem' }}>
                <div style={{ position: 'relative' }}>
                    <textarea 
                        value={newComment} 
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="form-input"
                        rows="2"
                        style={{ paddingRight: '3rem' }}
                    ></textarea>
                    <button 
                        type="submit" 
                        disabled={loading || !newComment.trim()} 
                        className="btn-icon"
                        style={{ 
                            position: 'absolute', 
                            right: '0.5rem', 
                            bottom: '0.5rem', 
                            color: newComment.trim() ? 'var(--primary)' : 'var(--text-muted)' 
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>

            <div className="comment-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comments.map(comment => (
                    <div key={comment.id} className="comment-item" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{comment.user.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {new Date(comment.createdAt).toLocaleString()}
                                </span>
                            </div>
                            
                            {currentUser && (currentUser.id === comment.user.id || currentUser.role === 'ROLE_ADMIN') && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {editingId !== comment.id && currentUser.id === comment.user.id && (
                                        <button onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }} className="btn-icon-sm"><Edit2 size={14} /></button>
                                    )}
                                    <button onClick={() => handleDeleteComment(comment.id)} className="btn-icon-sm" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                                </div>
                            )}
                        </div>

                        {editingId === comment.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <textarea 
                                    value={editContent} 
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="form-input"
                                    rows="2"
                                ></textarea>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setEditingId(null)} className="btn btn-outline btn-xs"><X size={14} /></button>
                                    <button onClick={() => handleUpdateComment(comment.id)} className="btn btn-primary btn-xs"><Check size={14} /></button>
                                </div>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-main)' }}>{comment.content}</p>
                        )}
                    </div>
                ))}
                {comments.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No comments yet.</p>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
