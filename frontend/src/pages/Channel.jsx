import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as api from '../api/client'
import { useAuth } from '../context/AuthContext'
import VideoCard from '../components/VideoCard'

/**
 * Channel page — shows a user's public profile, stats, and tabs for Videos, Playlists, and Tweets.
 */
export default function Channel() {
  const { username } = useParams()
  const { user } = useAuth()

  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  // Tabs state
  const [activeTab, setActiveTab] = useState('videos')

  // Videos state
  const [videos, setVideos] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(false)

  // Playlists state
  const [playlists, setPlaylists] = useState([])
  const [loadingPlaylists, setLoadingPlaylists] = useState(false)

  // Tweets state
  const [tweets, setTweets] = useState([])
  const [loadingTweets, setLoadingTweets] = useState(false)
  const [newTweetContent, setNewTweetContent] = useState('')
  const [editingTweetId, setEditingTweetId] = useState(null)
  const [editingContent, setEditingContent] = useState('')

  useEffect(() => {
    async function loadChannel() {
      try {
        const res = await api.getChannelProfile(username)
        setChannel(res.data)
        // Reset to videos tab on channel change
        setActiveTab('videos')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadChannel()
  }, [username])

  // Fetch data depending on active tab
  useEffect(() => {
    if (!channel) return

    if (activeTab === 'videos') {
      async function fetchVideos() {
        setLoadingVideos(true)
        try {
          const res = await api.getAllVideos({ userId: channel._id })
          // Ensure compatibility format for VideoCard
          const formatted = (res.data.docs || []).map((vid) => ({
            ...vid,
            ownerDetails: vid.ownerDetails || { username: channel.username, avatar: channel.avatar },
          }))
          setVideos(formatted)
        } catch (err) {
          console.error('Error fetching channel videos:', err)
        } finally {
          setLoadingVideos(false)
        }
      }
      fetchVideos()
    } else if (activeTab === 'playlists') {
      async function fetchPlaylists() {
        setLoadingPlaylists(true)
        try {
          const res = await api.getUserPlaylists(channel._id)
          setPlaylists(res.data || [])
        } catch (err) {
          console.error('Error fetching channel playlists:', err)
        } finally {
          setLoadingPlaylists(false)
        }
      }
      fetchPlaylists()
    } else if (activeTab === 'tweets') {
      async function fetchTweets() {
        setLoadingTweets(true)
        try {
          const res = await api.getUserTweets(channel._id)
          setTweets(res.data || [])
        } catch (err) {
          console.error('Error fetching channel tweets:', err)
        } finally {
          setLoadingTweets(false)
        }
      }
      fetchTweets()
    }
  }, [activeTab, channel])

  async function handleToggleSubscribe() {
    if (!channel) return
    setSubscribing(true)
    try {
      const res = await api.toggleSubscription(channel._id)
      setChannel((prev) => {
        const isSubscribed = res.data.isSubscribed
        const subscribersCount = isSubscribed
          ? (prev.subscribersCount || 0) + 1
          : Math.max((prev.subscribersCount || 0) - 1, 0)
        return {
          ...prev,
          isSubscribed,
          subscribersCount,
        }
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubscribing(false)
    }
  }

  async function handleCreateTweet(e) {
    e.preventDefault()
    if (!newTweetContent.trim()) return

    try {
      const res = await api.createTweet(newTweetContent)
      // Inject owner object locally for proper render details
      const newTweetObj = {
        ...res.data,
        owner: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
      }
      setTweets((prev) => [newTweetObj, ...prev])
      setNewTweetContent('')
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDeleteTweet(tweetId) {
    if (!window.confirm('Are you sure you want to delete this tweet?')) return

    try {
      await api.deleteTweet(tweetId)
      setTweets((prev) => prev.filter((t) => t._id !== tweetId))
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleStartEdit(tweet) {
    setEditingTweetId(tweet._id)
    setEditingContent(tweet.content)
  }

  async function handleUpdateTweet(tweetId) {
    if (!editingContent.trim()) return

    try {
      const res = await api.updateTweet(tweetId, editingContent)
      setTweets((prev) =>
        prev.map((t) => (t._id === tweetId ? { ...t, content: res.data.content } : t))
      )
      setEditingTweetId(null)
      setEditingContent('')
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="page-center">Loading channel...</div>
  if (error) return <div className="page-center error">{error}</div>
  if (!channel) return <div className="page-center">Channel not found</div>

  const isOwner = user && user._id === channel._id

  return (
    <div className="page channel-page">
      {/* Banner & Avatar */}
      <div className="channel-header">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="" className="channel-cover" />
        ) : (
          <div className="channel-cover-fallback" />
        )}
        <div className="channel-info-row">
          <div className="channel-info">
            <img src={channel.avatar} alt="" className="avatar-lg" />
            <div className="channel-details">
              <h1>{channel.fullName}</h1>
              <p className="muted">@{channel.username}</p>
              <div className="channel-stats">
                {channel.subscribersCount} subscribers · {channel.channelsSubscribedToCount} subscribed
              </div>
            </div>
          </div>

          {user && user.username !== channel.username && (
            <button
              className={`btn ${channel.isSubscribed ? 'btn-subscribed' : 'btn-subscribe'}`}
              onClick={handleToggleSubscribe}
              disabled={subscribing}
            >
              {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="channel-tabs-bar">
        <button
          onClick={() => setActiveTab('videos')}
          className={`tab-link ${activeTab === 'videos' ? 'active' : ''}`}
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab('playlists')}
          className={`tab-link ${activeTab === 'playlists' ? 'active' : ''}`}
        >
          Playlists
        </button>
        <button
          onClick={() => setActiveTab('tweets')}
          className={`tab-link ${activeTab === 'tweets' ? 'active' : ''}`}
        >
          Tweets
        </button>
      </div>

      <div className="tab-content-container">
        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="tab-pane">
            {loadingVideos ? (
              <p className="muted">Loading videos...</p>
            ) : videos.length === 0 ? (
              <div className="empty-state">
                <p>This channel has no videos.</p>
              </div>
            ) : (
              <div className="video-grid">
                {videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <div className="tab-pane">
            {loadingPlaylists ? (
              <p className="muted">Loading playlists...</p>
            ) : playlists.length === 0 ? (
              <div className="empty-state">
                <p>This channel has no public playlists.</p>
              </div>
            ) : (
              <div className="playlist-grid">
                {playlists.map((playlist) => (
                  <div key={playlist._id} className="playlist-card">
                    <div className="playlist-card-icon">📁</div>
                    <div className="playlist-card-content">
                      <h3>{playlist.name}</h3>
                      <p className="muted description-trunc">{playlist.description}</p>
                      <p className="video-count">{playlist.videos?.length || 0} videos</p>
                      <Link to={`/playlist/${playlist._id}`} className="btn btn-ghost btn-sm">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tweets Tab */}
        {activeTab === 'tweets' && (
          <div className="tab-pane tweets-tab-pane">
            {/* Create Tweet Form (Channel Owner Only) */}
            {isOwner && (
              <form onSubmit={handleCreateTweet} className="tweet-create-box">
                <textarea
                  placeholder="What's on your mind? Share a community update..."
                  value={newTweetContent}
                  onChange={(e) => setNewTweetContent(e.target.value)}
                  maxLength={280}
                  required
                />
                <div className="tweet-create-actions">
                  <span className="muted">{280 - newTweetContent.length} characters left</span>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Post Update
                  </button>
                </div>
              </form>
            )}

            {/* Tweets List */}
            {loadingTweets ? (
              <p className="muted">Loading updates...</p>
            ) : tweets.length === 0 ? (
              <div className="empty-state">
                <p>No community updates posted yet.</p>
              </div>
            ) : (
              <div className="tweets-list">
                {tweets.map((tweet) => {
                  const tweetOwner = tweet.owner || channel
                  const isTweetOwner = user && user._id === tweetOwner._id

                  return (
                    <div key={tweet._id} className="tweet-card-item">
                      <img src={tweetOwner.avatar} alt="" className="avatar-sm" />
                      <div className="tweet-body">
                        <div className="tweet-header">
                          <strong>{tweetOwner.username}</strong>
                          <span className="muted tweet-time">
                            {new Date(tweet.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {editingTweetId === tweet._id ? (
                          <div className="tweet-edit-container">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              required
                            />
                            <div className="tweet-edit-actions">
                              <button
                                onClick={() => handleUpdateTweet(tweet._id)}
                                className="btn btn-primary btn-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingTweetId(null)}
                                className="btn btn-ghost btn-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="tweet-text">{tweet.content}</p>
                        )}

                        {isTweetOwner && editingTweetId !== tweet._id && (
                          <div className="tweet-actions-row">
                            <button
                              onClick={() => handleStartEdit(tweet)}
                              className="btn-text-action"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTweet(tweet._id)}
                              className="btn-text-action danger"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
