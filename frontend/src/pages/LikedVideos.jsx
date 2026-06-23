import { useEffect, useState } from 'react'
import * as api from '../api/client'
import VideoCard from '../components/VideoCard'

export default function LikedVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadLikedVideos() {
      try {
        const res = await api.getLikedVideos()
        // Extract 'likedVideo' from aggregate objects
        const extracted = (res.data || []).map((item) => item.likedVideo)
        setVideos(extracted)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadLikedVideos()
  }, [])

  if (loading) return <div className="page-center">Loading liked videos...</div>
  if (error) return <div className="page-center error">{error}</div>

  return (
    <div className="page">
      <h1>Liked Videos</h1>

      {videos.length === 0 ? (
        <div className="empty-state">
          <p>You haven't liked any videos yet.</p>
          <p className="muted">Videos you like will appear here!</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
