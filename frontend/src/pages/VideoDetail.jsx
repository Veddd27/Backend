import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../api/client'
import CommentSection from '../components/CommentSection'
import { useAuth } from '../context/AuthContext'

/**
 * VideoDetail — single video page with player, like button, and comments.
 *
 * useParams() reads :videoId from the URL (set up in App.jsx routes).
 */
export default function VideoDetail() {
  const { videoId } = useParams()
  const { user } = useAuth()

  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liking, setLiking] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  // Playlist dropdown states
  const [playlists, setPlaylists] = useState([])
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false)

  useEffect(() => {
    if (user) {
      api.getUserPlaylists(user._id)
        .then((res) => setPlaylists(res.data || []))
        .catch((err) => console.error('Error loading user playlists:', err))
    }
  }, [user])

  useEffect(() => {
    async function loadVideo() {
      try {
        const res = await api.getVideoById(videoId)
        setVideo(res.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadVideo()
  }, [videoId])

  async function handleLike() {
    setLiking(true)
    try {
      const res = await api.toggleVideoLike(videoId)
      setVideo((prev) => ({
        ...prev,
        isLiked: res.data.isLiked,
        likesCount: res.data.isLiked
          ? (prev.likesCount || 0) + 1
          : Math.max((prev.likesCount || 0) - 1, 0),
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLiking(false)
    }
  }

  async function handleToggleSubscribe() {
    if (!video || !video.owner) return
    setSubscribing(true)
    try {
      const res = await api.toggleSubscription(video.owner._id)
      setVideo((prev) => {
        const isSubscribed = res.data.isSubscribed
        const subscribersCount = isSubscribed
          ? (prev.owner.subscribersCount || 0) + 1
          : Math.max((prev.owner.subscribersCount || 0) - 1, 0)
        return {
          ...prev,
          owner: {
            ...prev.owner,
            isSubscribed,
            subscribersCount,
          },
        }
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubscribing(false)
    }
  }
  async function handleAddToPlaylist(playlistId) {
    try {
      await api.addVideoToPlaylist(videoId, playlistId)
      alert('Video added to playlist successfully!')
      setShowPlaylistDropdown(false)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="page-center">Loading video...</div>
  if (error) return <div className="page-center error">{error}</div>
  if (!video) return <div className="page-center">Video not found</div>

  return (
    <div className="page video-detail">
      <div className="video-player">
        <video src={video.videoFile} controls poster={video.thumbnail} />
      </div>

      <div className="video-meta">
        <h1>{video.title}</h1>
        <div className="video-actions">
          <span className="muted">{video.views} views</span>
          <button
            className={`btn ${video.isLiked ? 'btn-liked' : 'btn-ghost'}`}
            onClick={handleLike}
            disabled={liking}
          >
            {video.isLiked ? '❤️ Liked' : '🤍 Like'} ({video.likesCount || 0})
          </button>

          {user && (
            <div className="add-to-playlist-container" style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
              >
                ➕ Save
              </button>
              {showPlaylistDropdown && (
                <div className="playlist-mini-dropdown">
                  <h4>Save to...</h4>
                  {playlists.length === 0 ? (
                    <p className="muted" style={{ padding: '8px', fontSize: '0.85rem' }}>
                      No playlists found. Create one in the Playlists page!
                    </p>
                  ) : (
                    <div className="mini-pl-list">
                      {playlists.map((pl) => (
                        <button
                          key={pl._id}
                          onClick={() => handleAddToPlaylist(pl._id)}
                          className="mini-pl-item"
                        >
                          📁 {pl.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <p className="description">{video.description}</p>

        {video.owner && (
          <div className="owner-row">
            <Link to={`/channel/${video.owner.username}`} className="owner-info">
              <img src={video.owner.avatar} alt="" className="avatar-md" />
              <div>
                <strong>{video.owner.username}</strong>
                <p className="muted">{video.owner.subscribersCount || 0} subscribers</p>
              </div>
            </Link>

            {user && user.username !== video.owner.username && (
              <button
                className={`btn ${video.owner.isSubscribed ? 'btn-subscribed' : 'btn-subscribe'}`}
                onClick={handleToggleSubscribe}
                disabled={subscribing}
              >
                {video.owner.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>
        )}
      </div>

      <CommentSection videoId={videoId} />
    </div>
  )
}
