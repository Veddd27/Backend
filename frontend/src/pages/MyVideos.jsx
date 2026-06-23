import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api/client'

/**
 * MyVideos — shows YOUR uploaded videos (published or not).
 * Uses the dashboard API which returns all videos you own.
 */
export default function MyVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadVideos()
  }, [])

  async function loadVideos() {
    try {
      const res = await api.getMyVideos()
      setVideos(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleTogglePublish(videoId) {
    try {
      const res = await api.togglePublish(videoId)
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, isPublished: res.data.isPublished } : v
        )
      )
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="page-center">Loading your videos...</div>

  return (
    <div className="page">
      <h1>My Videos</h1>
      {error && <p className="error">{error}</p>}

      {videos.length === 0 ? (
        <div className="empty-state">
          <p>You haven't uploaded any videos yet.</p>
          <Link to="/upload" className="btn btn-primary">Upload your first video</Link>
        </div>
      ) : (
        <div className="my-videos-list">
          {videos.map((video) => (
            <div key={video._id} className="my-video-row">
              <Link to={`/video/${video._id}`} className="my-video-thumb">
                <img src={video.thumbnail} alt={video.title} />
              </Link>
              <div className="my-video-info">
                <Link to={`/video/${video._id}`}>
                  <h3>{video.title}</h3>
                </Link>
                <p className="muted">
                  {video.views} views · {video.likesCount || 0} likes
                </p>
                <span className={`badge ${video.isPublished ? 'badge-green' : 'badge-gray'}`}>
                  {video.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => handleTogglePublish(video._id)}
              >
                {video.isPublished ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
