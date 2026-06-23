import { useEffect, useState } from 'react'
import * as api from '../api/client'

/**
 * CommentSection — loads and displays comments for one video.
 *
 * useEffect runs after the component renders. We call the API
 * whenever videoId changes to fetch fresh comments.
 */
export default function CommentSection({ videoId }) {
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadComments() {
      try {
        const res = await api.getComments(videoId)
        setComments(res.data.docs || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadComments()
  }, [videoId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    setError('')

    try {
      const res = await api.addComment(videoId, content)
      setComments((prev) => [res.data, ...prev])
      setContent('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="muted">Loading comments...</p>

  return (
    <div className="comments">
      <h3>Comments ({comments.length})</h3>

      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Posting...' : 'Comment'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="comment-list">
        {comments.length === 0 && <p className="muted">No comments yet. Be the first!</p>}
        {comments.map((comment) => (
          <div key={comment._id} className="comment-item">
            {comment.owner?.avatar && (
              <img src={comment.owner.avatar} alt="" className="avatar-sm" />
            )}
            <div>
              <strong>{comment.owner?.username || 'User'}</strong>
              <p>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
