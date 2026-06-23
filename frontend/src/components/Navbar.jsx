import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as api from '../api/client'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  // Handle clicking outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search logic for autocomplete suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.getAllVideos({ query: searchQuery, limit: 5 })
        setSuggestions(res.data.docs || [])
      } catch (err) {
        console.error('Error fetching search suggestions:', err)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  function handleSelectSuggestion(videoId) {
    setShowSuggestions(false)
    setSearchQuery('')
    navigate(`/video/${videoId}`)
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        StreamForge
      </Link>

      {user && (
        <div className="search-container" ref={searchRef}>
          <span className="search-icon-nav">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion._id}
                  className="suggestion-item"
                  onClick={() => handleSelectSuggestion(suggestion._id)}
                >
                  <img
                    src={suggestion.thumbnail}
                    alt=""
                    className="suggestion-thumb"
                  />
                  <div className="suggestion-details">
                    <div className="suggestion-title">{suggestion.title}</div>
                    <div className="suggestion-channel">
                      @{suggestion.ownerDetails?.username || 'user'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="nav-links">
        {user ? (
          <>
            <Link to="/upload">Upload</Link>
            <Link to="/my-videos">My Videos</Link>
            <Link to={`/channel/${user.username}`} className="nav-user">
              {user.avatar && <img src={user.avatar} alt="" className="avatar-sm" />}
              {user.username}
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
