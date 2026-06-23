import { useEffect, useState } from 'react'
import * as api from '../api/client'
import VideoCard from '../components/VideoCard'

export default function WatchHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.getWatchHistory()
        // Map backend 'owner' field to 'ownerDetails' for VideoCard compatibility
        const formatted = (res.data || []).map((video) => ({
          ...video,
          ownerDetails: video.ownerDetails || video.owner,
        }))
        setHistory(formatted)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  if (loading) return <div className="page-center">Loading watch history...</div>
  if (error) return <div className="page-center error">{error}</div>

  return (
    <div className="page">
      <h1>Watch History</h1>

      {history.length === 0 ? (
        <div className="empty-state">
          <p>Your watch history is empty.</p>
          <p className="muted">Videos you watch will appear here!</p>
        </div>
      ) : (
        <div className="video-grid">
          {history.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
