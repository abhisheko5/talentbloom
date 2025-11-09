import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, ThumbsUp, Send, Search, CheckCircle, Sparkles, User, Clock, Trash2, TrendingUp, Calendar, Filter, X, Loader2 } from 'lucide-react';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const DiscussionForum = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPost, setNewPost] = useState({ title: '', content: '', author: '' });
  const [newReply, setNewReply] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [sortBy, setSortBy] = useState('votes');
  const [loading, setLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({ total: 0, answered: 0, pending: 0 });
  
  const socketRef = useRef(null);

  // Memoized stats calculation
  const calculateStats = useCallback((postsData) => {
    setStats({
      total: postsData.length,
      answered: postsData.filter(p => p.answered).length,
      pending: postsData.filter(p => !p.answered).length
    });
  }, []);

  // Update stats whenever posts change
  useEffect(() => {
    calculateStats(posts);
  }, [posts, calculateStats]);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Initialize socket ONCE
  useEffect(() => {
    console.log('🔌 Connecting to socket...');
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to socket server:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    socketRef.current.on('newPost', (post) => {
      console.log('📨 New post received:', post);
      setPosts(prev => {
        // Avoid duplicates
        if (prev.some(p => p._id === post._id)) {
          console.log('⚠️ Duplicate post, skipping');
          return prev;
        }
        console.log('✅ Adding new post to list');
        return [post, ...prev];
      });
      showNotification('New post added!', 'success');
    });

    socketRef.current.on('newReply', ({ postId, reply }) => {
      console.log('💬 New reply received for post:', postId);
      
      setPosts(prev => prev.map(p => 
        p._id === postId ? { ...p, replyCount: (p.replyCount || 0) + 1 } : p
      ));
      
      // Update selected post if it matches
      setSelectedPost(prev => {
        if (prev?._id === postId) {
          console.log('✅ Updating selected post with new reply');
          return {
            ...prev,
            replies: [...(prev.replies || []), reply],
            replyCount: (prev.replyCount || 0) + 1
          };
        }
        return prev;
      });
      
      showNotification('New reply added!', 'success');
    });

    socketRef.current.on('postUpdated', (updatedPost) => {
      console.log('🔄 Post updated:', updatedPost._id);
      
      setPosts(prev => prev.map(p => 
        p._id === updatedPost._id ? updatedPost : p
      ));
      
      setSelectedPost(prev => 
        prev?._id === updatedPost._id ? updatedPost : prev
      );
    });

    socketRef.current.on('postDeleted', ({ postId }) => {
      console.log('🗑️ Post deleted:', postId);
      
      setPosts(prev => prev.filter(p => p._id !== postId));
      setSelectedPost(prev => prev?._id === postId ? null : prev);
      showNotification('Post deleted', 'info');
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting socket...');
      socketRef.current?.disconnect();
    };
  }, [showNotification]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/posts?sortBy=${sortBy}&search=${searchQuery}`);
      const data = await response.json();
      if (data.success) {
        console.log('📥 Fetched posts:', data.data.length);
        setPosts(data.data);
      }
    } catch (error) {
      showNotification('Failed to fetch posts', 'error');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length === 0 || searchQuery.length >= 2) {
        fetchPosts();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPostDetails = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedPost(data.data);
      }
    } catch (error) {
      showNotification('Failed to fetch post details', 'error');
      console.error('Error fetching post details:', error);
    }
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      showNotification('Title and content are required', 'error');
      return;
    }

    setPostLoading(true);
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          author: newPost.author || 'Anonymous'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Post created successfully');
        setNewPost({ title: '', content: '', author: '' });
        setShowNewPost(false);
        setAiSuggestions([]);
        showNotification('Post created successfully!', 'success');
        // Socket will handle adding to list
      } else {
        showNotification(data.error || 'Failed to create post', 'error');
      }
    } catch (error) {
      showNotification('Failed to create post', 'error');
      console.error('Error creating post:', error);
    } finally {
      setPostLoading(false);
    }
  };

  const addReply = async () => {
    if (!newReply.trim() || !selectedPost) {
      showNotification('Reply content is required', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${selectedPost._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newReply,
          author: 'You'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Reply added successfully');
        setNewReply('');
        showNotification('Reply added successfully!', 'success');
        // Socket will handle updating
      } else {
        showNotification(data.error || 'Failed to add reply', 'error');
      }
    } catch (error) {
      showNotification('Failed to add reply', 'error');
      console.error('Error adding reply:', error);
    }
  };

  const upvotePost = async (postId, e) => {
    if (e) e.stopPropagation();
    
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/upvote`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Post upvoted');
        // Socket will handle the update
      }
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  const markAsAnswered = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/answered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answered: !selectedPost.answered })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Post marked as', data.data.answered ? 'answered' : 'unanswered');
        showNotification(
          data.data.answered ? 'Marked as answered!' : 'Marked as unanswered',
          'success'
        );
        // Socket will handle the update
      }
    } catch (error) {
      showNotification('Failed to update post', 'error');
      console.error('Error marking as answered:', error);
    }
  };

  const deletePost = async (postId, e) => {
    if (e) e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Post deleted');
        showNotification('Post deleted successfully', 'success');
        // Socket will handle the update
      }
    } catch (error) {
      showNotification('Failed to delete post', 'error');
      console.error('Error deleting post:', error);
    }
  };

  useEffect(() => {
    if (newPost.content.length > 20) {
      const suggestions = [
        "Similar: 'Node.js deployment best practices'",
        "Related: 'Docker containerization guide'"
      ];
      setAiSuggestions(suggestions);
    } else {
      setAiSuggestions([]);
    }
  }, [newPost.content]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    
    if (days > 7) return date.toLocaleDateString();
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 border-l-4 shadow-lg bg-white ${
          notification.type === 'success' ? 'border-green-600' :
          notification.type === 'error' ? 'border-red-600' : 'border-black'
        }`}>
          <p className="text-sm font-medium text-gray-900">{notification.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">Learnato Forum</h1>
                <p className="text-sm text-gray-600">Community Q&A</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewPost(!showNewPost)}
              className="bg-black hover:bg-gray-800 text-white px-5 py-2 font-medium border-2 border-black transition-colors"
            >
              New Post
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="border-2 border-black p-3">
              <p className="text-xs font-bold text-gray-600 mb-1">TOTAL</p>
              <p className="text-2xl font-bold text-black">{stats.total}</p>
            </div>
            <div className="border-2 border-green-600 p-3 bg-green-50">
              <p className="text-xs font-bold text-green-800 mb-1">SOLVED</p>
              <p className="text-2xl font-bold text-green-600">{stats.answered}</p>
            </div>
            <div className="border-2 border-gray-400 p-3">
              <p className="text-xs font-bold text-gray-600 mb-1">OPEN</p>
              <p className="text-2xl font-bold text-gray-700">{stats.pending}</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border-2 border-black focus:outline-none"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-black bg-white focus:outline-none cursor-pointer"
            >
              <option value="votes">Top Voted</option>
              <option value="date">Latest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* New Post Form */}
        {showNewPost && (
          <div className="border-2 border-black p-5 mb-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black">New Post</h3>
              <button
                onClick={() => setShowNewPost(false)}
                className="hover:bg-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full px-3 py-2 border-2 border-black mb-3 focus:outline-none"
            />
            
            <textarea
              placeholder="Description"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full px-3 py-2 border-2 border-black mb-3 h-28 focus:outline-none resize-none"
            />
            
            <input
              type="text"
              placeholder="Your name (optional)"
              value={newPost.author}
              onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
              className="w-full px-3 py-2 border-2 border-black mb-3 focus:outline-none"
            />
            
            {aiSuggestions.length > 0 && (
              <div className="border-2 border-gray-300 p-3 mb-3 bg-white">
                <p className="text-xs font-bold text-gray-700 mb-2">SUGGESTIONS</p>
                {aiSuggestions.map((suggestion, idx) => (
                  <p key={idx} className="text-sm text-gray-600 mb-1">• {suggestion}</p>
                ))}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={createPost}
                disabled={postLoading}
                className="flex-1 bg-black hover:bg-gray-800 text-white px-5 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {postLoading ? 'Posting...' : 'Post'}
              </button>
              <button
                onClick={() => {
                  setShowNewPost(false);
                  setNewPost({ title: '', content: '', author: '' });
                  setAiSuggestions([]);
                }}
                className="border-2 border-black hover:bg-gray-100 px-5 py-2 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Posts List */}
          <div className="md:col-span-2 space-y-4">
            {loading ? (
              <div className="border-2 border-black p-10 text-center">
                <Loader2 className="w-10 h-10 text-black mx-auto mb-3 animate-spin" />
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="border-2 border-dashed border-gray-400 p-10 text-center">
                <MessageSquare className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-1">No posts yet</p>
                <p className="text-gray-500 text-sm">Start a discussion</p>
              </div>
            ) : (
              posts.map(post => (
                <div
                  key={post._id}
                  onClick={() => fetchPostDetails(post._id)}
                  className={`border-2 cursor-pointer transition-all ${
                    selectedPost?._id === post._id 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${post.answered ? 'border-green-600 bg-green-50' : ''}`}
                >
                  <div className="p-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={(e) => upvotePost(post._id, e)}
                          className="hover:bg-gray-200 p-2"
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        <span className="text-lg font-bold">
                          {post.votes}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold text-black">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {post.answered && (
                              <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2.5} />
                            )}
                            <button
                              onClick={(e) => deletePost(post._id, e)}
                              className="hover:bg-red-100 p-1"
                            >
                              <Trash2 className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{post.content}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="font-medium">{post.author}</span>
                          <span>•</span>
                          <span>{formatTime(post.createdAt)}</span>
                          <span>•</span>
                          <span>{post.replyCount || 0} replies</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Post Details */}
          <div className="md:col-span-1">
            {selectedPost ? (
              <div className="border-2 border-black sticky top-6">
                <div className="bg-black p-4 text-white">
                  <h3 className="font-bold">Details</h3>
                </div>
                
                <div className="p-4 bg-white max-h-[calc(100vh-140px)] overflow-y-auto">
                  <div className="mb-5">
                    <h4 className="font-bold text-black mb-2">{selectedPost.title}</h4>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">{selectedPost.content}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-3 border-b">
                      <span className="font-medium">{selectedPost.author}</span>
                      <span>{formatTime(selectedPost.createdAt)}</span>
                    </div>
                    
                    <button
                      onClick={() => markAsAnswered(selectedPost._id)}
                      className={`w-full py-2 font-bold border-2 ${
                        selectedPost.answered
                          ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                          : 'border-black hover:bg-gray-100'
                      }`}
                    >
                      {selectedPost.answered ? '✓ Solved' : 'Mark Solved'}
                    </button>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-bold mb-3 text-sm">
                      REPLIES ({selectedPost.replies?.length || 0})
                    </h5>
                    
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {selectedPost.replies && selectedPost.replies.length > 0 ? (
                        selectedPost.replies.map(reply => (
                          <div key={reply._id} className="border-l-2 border-black pl-3 py-2">
                            <p className="text-sm text-gray-800 mb-2">{reply.content}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="font-bold">{reply.author}</span>
                              <span>{formatTime(reply.createdAt)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-6 text-sm">No replies</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <textarea
                        placeholder="Write reply..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black text-sm focus:outline-none resize-none"
                        rows="3"
                      />
                      <button
                        onClick={addReply}
                        className="w-full bg-black hover:bg-gray-800 text-white py-2 font-medium"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-400 p-8 text-center sticky top-6">
                <div className="w-16 h-16 border-2 border-gray-300 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium mb-1">Select a post</p>
                <p className="text-gray-500 text-sm">View details & replies</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionForum;