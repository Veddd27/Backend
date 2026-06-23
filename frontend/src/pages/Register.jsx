import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Register page — uses FormData for file uploads.
 *
 * Unlike JSON, file uploads need FormData (multipart/form-data).
 * The browser sends files + text fields together in one request.
 */
export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  })
  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!avatar) {
      setError('Avatar image is required')
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('fullName', form.fullName)
    formData.append('username', form.username)
    formData.append('email', form.email)
    formData.append('password', form.password)
    formData.append('avatar', avatar)
    if (coverImage) formData.append('coverImage', coverImage)

    try {
      await register(formData)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p className="muted">Join StreamForge</p>

        {error && <p className="error">{error}</p>}

        <label>
          Full Name
          <input name="fullName" value={form.fullName} onChange={handleChange} required />
        </label>

        <label>
          Username
          <input name="username" value={form.username} onChange={handleChange} required />
        </label>

        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>

        <label>
          Avatar (required, max 5MB)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            required
          />
          {avatar && <span className="muted">Selected: {avatar.name}</span>}
        </label>

        <label>
          Cover Image (optional)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
          />
        </label>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
