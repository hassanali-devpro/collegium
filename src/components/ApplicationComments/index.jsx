import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { useAddCommentToApplicationMutation, useUpdateApplicationCommentMutation, useDeleteApplicationCommentMutation } from '../../features/applications/applicationApi';
import { useToastContext } from '../../contexts/ToastContext';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import ConfirmationModal from '../ConfirmationModal';
import { MessageCircle, Send, Edit2, Trash2, X, Check } from 'lucide-react';

const ApplicationComments = ({ applicationId, comments = [], activeTab = 'kcTeam' }) => {
  const { user } = useSelector((state) => state.auth);
  const { error: showError } = useToastContext();
  const { modalState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationModal();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [socket, setSocket] = useState(null);
  const [socketComments, setSocketComments] = useState(comments);
  const [hideFromCounselor, setHideFromCounselor] = useState(false);
  const commentsEndRef = useRef(null);

  // RTK Query mutations
  const [addComment, { isLoading: isAdding }] = useAddCommentToApplicationMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateApplicationCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteApplicationCommentMutation();

  // Initialize socket connection
  useEffect(() => {
    const token = JSON.parse(sessionStorage.getItem('auth'))?.token;
    if (!token || !applicationId) return;

    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });

    // Join application room
    newSocket.emit('join_application', applicationId);

    // Listen for new comments
    newSocket.on('new_application_comment', (data) => {
      if (data.applicationId === applicationId) {
        setSocketComments(prev => [...prev, data.comment]);
      }
    });

    // Listen for comment updates
    newSocket.on('application_comment_updated', (data) => {
      if (data.applicationId === applicationId) {
        setSocketComments(prev => 
          prev.map(comment => 
            comment._id === data.commentId ? data.comment : comment
          )
        );
      }
    });

    // Listen for comment deletions
    newSocket.on('application_comment_deleted', (data) => {
      if (data.applicationId === applicationId) {
        setSocketComments(prev => 
          prev.filter(comment => comment._id !== data.commentId)
        );
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leave_application', applicationId);
        newSocket.disconnect();
      }
    };
  }, [applicationId]);

  // Update socket comments when props change
  useEffect(() => {
    setSocketComments(comments);
  }, [comments]);

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [socketComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isAdding) return;

    try {
      await addComment({
        applicationId,
        content: newComment.trim(),
        hideFromCounselor: hideFromCounselor,
        tab: activeTab
      }).unwrap();
      setNewComment('');
      setHideFromCounselor(false);
    } catch (error) {
      console.error('Error adding comment:', error);
      showError('Failed to add comment. Please try again.');
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditText(comment.content);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim() || isUpdating) return;

    try {
      await updateComment({
        applicationId,
        commentId,
        content: editText.trim()
      }).unwrap();
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating comment:', error);
      showError('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    showConfirmation({
      title: "Delete Comment",
      message: "Are you sure you want to delete this comment? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteComment({
            applicationId,
            commentId
          }).unwrap();
        } catch (error) {
          console.error('Error deleting comment:', error);
          showError('Failed to delete comment. Please try again.');
        }
      }
    });
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOwnComment = (comment) => {
    return comment.authorId === user?.id;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {socketComments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          socketComments.map((comment) => (
            <div
              key={comment._id}
              className={`flex ${isOwnComment(comment) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnComment(comment)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {/* Comment Header */}
                <div className={`flex items-center justify-between mb-1 ${
                  isOwnComment(comment) ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  <span className="text-xs font-medium">{comment.authorName}</span>
                  <span className="text-xs">{formatTime(comment.createdAt)}</span>
                </div>

                {/* Comment Content */}
                {editingComment === comment._id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className={`w-full p-2 rounded border resize-none ${
                        isOwnComment(comment)
                          ? 'bg-white text-gray-900 border-blue-300'
                          : 'bg-white text-gray-900 border-gray-300'
                      }`}
                      rows="2"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateComment(comment._id)}
                        disabled={isUpdating}
                        className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center space-x-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm">{comment.content}</p>
                    
                    {/* Action Buttons */}
                    {isOwnComment(comment) && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-700"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          disabled={isDeleting}
                          className="flex items-center space-x-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Comment Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-3">
          {/* Comment Input Field */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write comments..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAdding}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isAdding}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
        onConfirm={handleConfirm}
        onCancel={hideConfirmation}
      />
    </div>
  );
};

export default ApplicationComments;
