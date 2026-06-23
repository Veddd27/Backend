/**
 * App.jsx — the root component. Sets up:
 *  1. AuthProvider  → shares login state everywhere
 *  2. BrowserRouter → enables page navigation without full reloads
 *  3. Routes        → maps URLs to page components
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VideoDetail from './pages/VideoDetail'
import Upload from './pages/Upload'
import MyVideos from './pages/MyVideos'
import Channel from './pages/Channel'
import WatchHistory from './pages/WatchHistory'
import LikedVideos from './pages/LikedVideos'
import Playlists from './pages/Playlists'
import PlaylistDetail from './pages/PlaylistDetail'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes — need login */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/video/:videoId" element={<ProtectedRoute><VideoDetail /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/my-videos" element={<ProtectedRoute><MyVideos /></ProtectedRoute>} />
            <Route path="/channel/:username" element={<ProtectedRoute><Channel /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><WatchHistory /></ProtectedRoute>} />
            <Route path="/liked-videos" element={<ProtectedRoute><LikedVideos /></ProtectedRoute>} />
            <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
            <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Catch-all: unknown URLs go home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}
