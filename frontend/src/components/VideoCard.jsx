import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

/**
 * VideoCard — reusable card shown on the Home page grid.
 * Receives a `video` object from the API and displays thumbnail + title.
 */
export default function VideoCard({ video }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)
  const hoverTimeout = useRef(null)

  function handleMouseEnter() {
    // Wait 250ms before starting to play preview (prevents accidental plays)
    hoverTimeout.current = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log('Autoplay preview blocked:', err))
      }
    }, 250)
  }

  function handleMouseLeave() {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current)
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    }
  }, [])

  return (
    <Link
      to={`/video/${video._id}`}
      className="video-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="video-thumb">
        <img src={video.thumbnail} alt={video.title} />
        
        {/* Hover preview video element */}
        {video.videoFile && (
          <video
            ref={videoRef}
            src={video.videoFile}
            muted
            loop
            playsInline
            className={`video-hover-preview ${isPlaying ? 'playing' : ''}`}
          />
        )}

        {video.duration && (
          <span className="duration">{formatDuration(video.duration)}</span>
        )}
      </div>
      <div className="video-info">
        {video.ownerDetails?.avatar && (
          <img src={video.ownerDetails.avatar} alt="" className="avatar-sm" />
        )}
        <div>
          <h3>{video.title}</h3>
          <p className="muted">{video.ownerDetails?.username}</p>
          <p className="muted">
            {video.views ?? 0} views
          </p>
        </div>
      </div>
    </Link>
  )
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
