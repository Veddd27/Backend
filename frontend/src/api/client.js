/**
 * API Client — talks to your Express backend
 *
 * Every function here is just a fetch() call to one of your backend routes.
 * We store the JWT in localStorage after login and send it as:
 *   Authorization: Bearer <token>
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'
// File uploads go direct to backend — Vite proxy can break multipart/form-data
const UPLOAD_API_BASE = import.meta.env.VITE_UPLOAD_URL || 'http://localhost:8000/api/v1'

function getToken() {
  return localStorage.getItem('accessToken')
}

function buildHeaders(isFormData = false) {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isFormData) headers['Content-Type'] = 'application/json'
  return headers
}

async function request(endpoint, options = {}) {
  const { isFormData, ...fetchOptions } = options
  const base = isFormData ? UPLOAD_API_BASE : API_BASE

  let response
  try {
    response = await fetch(`${base}${endpoint}`, {
      ...fetchOptions,
      headers: { ...buildHeaders(isFormData), ...fetchOptions.headers },
      credentials: 'include',
    })
  } catch {
    throw new Error('Cannot reach server. Make sure the backend is running on port 8000.')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

// ─── Auth ───────────────────────────────────────────────
export function loginUser(credentials) {
  return request('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function registerUser(formData) {
  return request('/users/register', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export function logoutUser() {
  return request('/users/logout', { method: 'POST' })
}

export function getCurrentUser() {
  return request('/users/current-user')
}

// ─── Videos ─────────────────────────────────────────────
export function getAllVideos(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/videos${query ? `?${query}` : ''}`)
}

export function getVideoById(videoId) {
  return request(`/videos/${videoId}`)
}

export function publishVideo(formData) {
  return request('/videos', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export function togglePublish(videoId) {
  return request(`/videos/toggle/publish/${videoId}`, { method: 'PATCH' })
}

export function getMyVideos() {
  return request('/dashboard/videos')
}

// ─── Comments ───────────────────────────────────────────
export function getComments(videoId) {
  return request(`/comments/${videoId}`)
}

export function addComment(videoId, content) {
  return request(`/comments/${videoId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

// ─── Likes ──────────────────────────────────────────────
export function toggleVideoLike(videoId) {
  return request(`/likes/toggle/v/${videoId}`, { method: 'POST' })
}

// ─── Channel ────────────────────────────────────────────
export function getChannelProfile(username) {
  return request(`/users/c/${username}`)
}

// ─── Subscription ───────────────────────────────────────
export function toggleSubscription(channelId) {
  return request(`/subscription/c/${channelId}`, { method: 'POST' })
}
