import { useEffect, useState } from 'react'
import * as api from '../api/client'
import VideoCard from '../components/VideoCard'

/**
 * Home page — fetches all published videos and shows them in a grid.
 */
export default function Home() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadVideos() {
      try {
        const res = await api.getAllVideos()
        setVideos(res.data.docs || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadVideos()
  }, [])

  if (loading) return <div className="page-center">Loading videos...</div>
  if (error) return <div className="page-center error">{error}</div>

  return (
    <div className="page">
      <h1>Browse Videos</h1>

      {videos.length === 0 ? (
        <div className="empty-state">
          <p>No published videos yet.</p>
          <p className="muted">Upload a video and publish it to see it here!</p>
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
