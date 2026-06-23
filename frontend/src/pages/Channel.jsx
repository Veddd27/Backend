import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../api/client'
import { useAuth } from '../context/AuthContext'

/**
 * Channel page — shows a user's public profile.
 * The :username in the URL tells us whose channel to load.
 */
export default function Channel() {
  const { username } = useParams()
  const { user } = useAuth()

  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    async function loadChannel() {
      try {
        const res = await api.getChannelProfile(username)
        setChannel(res.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadChannel()
  }, [username])

  async function handleToggleSubscribe() {
    if (!channel) return
    setSubscribing(true)
    try {
      const res = await api.toggleSubscription(channel._id)
      setChannel((prev) => {
        const isSubscribed = res.data.isSubscribed
        const subscribersCount = isSubscribed
          ? (prev.subscribersCount || 0) + 1
          : Math.max((prev.subscribersCount || 0) - 1, 0)
        return {
          ...prev,
          isSubscribed,
          subscribersCount,
        }
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) return <div className="page-center">Loading channel...</div>
  if (error) return <div className="page-center error">{error}</div>
  if (!channel) return <div className="page-center">Channel not found</div>

  return (
    <div className="page">
      <div className="channel-header">
        {channel.coverImage && (
          <img src={channel.coverImage} alt="" className="channel-cover" />
        )}
        <div className="channel-info-row">
          <div className="channel-info">
            <img src={channel.avatar} alt="" className="avatar-lg" />
            <div className="channel-details">
              <h1>{channel.fullName}</h1>
              <p className="muted">@{channel.username}</p>
              <div className="channel-stats">
                {channel.subscribersCount} subscribers · {channel.channelsSubscribedToCount} subscribed
              </div>
            </div>
          </div>

          {user && user.username !== channel.username && (
            <button
              className={`btn ${channel.isSubscribed ? 'btn-subscribed' : 'btn-subscribe'}`}
              onClick={handleToggleSubscribe}
              disabled={subscribing}
            >
              {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
