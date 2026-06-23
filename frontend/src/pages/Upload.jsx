import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../api/client'

/**
 * Upload page — sends video + thumbnail files to the backend.
 *
 * Your backend uses multer to receive files, uploads them to Cloudinary,
 * then saves the video URL in MongoDB.
 */
export default function Upload() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!videoFile || !thumbnail) {
      setError('Both video file and thumbnail are required')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('videoFile', videoFile)
    formData.append('thumbnail', thumbnail)

    setLoading(true)

    try {
      const res = await api.publishVideo(formData)
      setSuccess('Video uploaded! Go to My Videos to publish it.')
      setTimeout(() => navigate(`/video/${res.data._id}`), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="form-card">
        <h1>Upload a Video</h1>
        <p className="muted">Videos start as unpublished — publish them from My Videos.</p>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form onSubmit={handleSubmit} className="upload-form">
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </label>

          <label>
            Video File
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} required />
          </label>

          <label>
            Thumbnail
            <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} required />
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  )
}
