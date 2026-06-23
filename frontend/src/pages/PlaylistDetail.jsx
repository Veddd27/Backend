import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as api from '../api/client'
import VideoCard from '../components/VideoCard'

export default function PlaylistDetail() {
  const { playlistId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function loadPlaylist() {
    try {
      const res = await api.getPlaylistById(playlistId)
      setPlaylist(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlaylist()
  }, [playlistId])

  async function handleDeletePlaylist() {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return

    setDeleting(true)
    try {
      await api.deletePlaylist(playlistId)
      navigate('/playlists')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  async function handleRemoveVideo(videoId, e) {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Remove this video from the playlist?')) return

    try {
      await api.removeVideoFromPlaylist(videoId, playlistId)
      // Reload playlist
      await loadPlaylist()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="page-center">Loading playlist...</div>
  if (error) return <div className="page-center error">{error}</div>
  if (!playlist) return <div className="page-center">Playlist not found</div>

  const isOwner = user && playlist.owner && user._id === playlist.owner._id

  // Map playlist owner as fallback for VideoCard ownerDetails
  const formattedVideos = (playlist.videos || []).map((video) => ({
    ...video,
    ownerDetails: video.ownerDetails || playlist.owner || { username: 'creator' },
  }))

  return (
    <div className="page playlist-detail-page">
      <div className="playlist-detail-header">
        <div className="playlist-meta-info">
          <h1>📁 {playlist.name}</h1>
          <p className="description">{playlist.description}</p>
          <p className="muted">
            Created by: <strong>@{playlist.owner?.username || 'user'}</strong> ·{' '}
            {playlist.totalVideos || 0} videos
          </p>
        </div>

        {isOwner && (
          <button
            onClick={handleDeletePlaylist}
            className="btn btn-danger"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Playlist'}
          </button>
        )}
      </div>

      <hr className="divider" />

      <h2>Videos ({playlist.videos?.length || 0})</h2>

      {formattedVideos.length === 0 ? (
        <div className="empty-state">
          <p>No videos in this playlist yet.</p>
          <p className="muted">Add videos from any video's watch page!</p>
        </div>
      ) : (
        <div className="video-list-with-actions">
          {formattedVideos.map((video) => (
            <div key={video._id} className="playlist-video-item-wrapper">
              <VideoCard video={video} />
              {isOwner && (
                <button
                  onClick={(e) => handleRemoveVideo(video._id, e)}
                  className="btn btn-sm btn-danger remove-btn"
                  title="Remove from playlist"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
