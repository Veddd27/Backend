import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as api from '../api/client'

export default function Playlists() {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create playlist form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function loadPlaylists() {
    if (!user) return
    try {
      const res = await api.getUserPlaylists(user._id)
      setPlaylists(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlaylists()
  }, [user])

  async function handleCreatePlaylist(e) {
    e.preventDefault()
    if (!name.trim() || !description.trim()) return

    setCreating(true)
    setCreateError('')

    try {
      await api.createPlaylist({ name, description })
      setName('')
      setDescription('')
      await loadPlaylists()
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div className="page-center">Loading playlists...</div>
  if (error) return <div className="page-center error">{error}</div>

  return (
    <div className="page playlists-page">
      <div className="page-header-row">
        <h1>My Playlists</h1>
      </div>

      <div className="playlists-container">
        {/* Create Playlist Form Sidecard */}
        <div className="playlist-form-card">
          <h2>Create New Playlist</h2>
          <form onSubmit={handleCreatePlaylist} className="form-group-container">
            <div className="form-field">
              <label>Playlist Name</label>
              <input
                type="text"
                placeholder="My Awesome Playlist"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea
                placeholder="Give your playlist a cool description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            {createError && <p className="error">{createError}</p>}
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>

        {/* Playlists List */}
        <div className="playlists-list-section">
          {playlists.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any playlists yet.</p>
              <p className="muted">Create one on the left to start organizing your videos!</p>
            </div>
          ) : (
            <div className="playlist-grid">
              {playlists.map((playlist) => (
                <div key={playlist._id} className="playlist-card">
                  <div className="playlist-card-icon">📁</div>
                  <div className="playlist-card-content">
                    <h3>{playlist.name}</h3>
                    <p className="muted description-trunc">{playlist.description}</p>
                    <p className="video-count">
                      {playlist.videos?.length || 0} {(playlist.videos?.length === 1) ? 'video' : 'videos'}
                    </p>
                    <Link to={`/playlist/${playlist._id}`} className="btn btn-ghost btn-sm">
                      View Playlist
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
