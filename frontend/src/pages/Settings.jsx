import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import * as api from '../api/client'

export default function Settings() {
  const { user, refreshUser } = useAuth()

  // Tab state
  const [activeTab, setActiveTab] = useState('account')

  // Form states: Account Details
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [accountMessage, setAccountMessage] = useState('')
  const [accountError, setAccountError] = useState('')
  const [updatingAccount, setUpdatingAccount] = useState(false)

  // Form states: Avatar Upload
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarMessage, setAvatarMessage] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Form states: Cover Image Upload
  const [coverFile, setCoverFile] = useState(null)
  const [coverMessage, setCoverMessage] = useState('')
  const [coverError, setCoverError] = useState('')
  const [uploadingCover, setUploadingCover] = useState(false)

  // Form states: Password Change
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  async function handleUpdateAccount(e) {
    e.preventDefault()
    setUpdatingAccount(true)
    setAccountMessage('')
    setAccountError('')

    try {
      await api.updateAccountDetails({ fullName, email })
      setAccountMessage('Account details updated successfully!')
      await refreshUser()
    } catch (err) {
      setAccountError(err.message)
    } finally {
      setUpdatingAccount(false)
    }
  }

  async function handleAvatarUpload(e) {
    e.preventDefault()
    if (!avatarFile) return

    setUploadingAvatar(true)
    setAvatarMessage('')
    setAvatarError('')

    const formData = new FormData()
    formData.append('avatar', avatarFile)

    try {
      await api.updateUserAvatar(formData)
      setAvatarMessage('Avatar updated successfully!')
      setAvatarFile(null)
      await refreshUser()
    } catch (err) {
      setAvatarError(err.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleCoverUpload(e) {
    e.preventDefault()
    if (!coverFile) return

    setUploadingCover(true)
    setCoverMessage('')
    setCoverError('')

    const formData = new FormData()
    formData.append('coverImage', coverFile)

    try {
      await api.updateUserCoverImage(formData)
      setCoverMessage('Channel banner updated successfully!')
      setCoverFile(null)
      await refreshUser()
    } catch (err) {
      setCoverError(err.message)
    } finally {
      setUploadingCover(false)
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    if (!oldPassword || !newPassword) return

    setUpdatingPassword(true)
    setPasswordMessage('')
    setPasswordError('')

    try {
      await api.changePassword({ oldPassword, newPassword })
      setPasswordMessage('Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <div className="page settings-page">
      <h1>Settings</h1>

      <div className="settings-container">
        {/* Navigation Tabs */}
        <div className="settings-sidebar">
          <button
            onClick={() => setActiveTab('account')}
            className={`settings-tab-btn ${activeTab === 'account' ? 'active' : ''}`}
          >
            👤 Account Details
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`settings-tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
          >
            🖼️ Profile & Banner
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          >
            🔒 Security
          </button>
        </div>

        {/* Tab Contents */}
        <div className="settings-content-card">
          {/* Account Details Tab */}
          {activeTab === 'account' && (
            <div className="tab-pane">
              <h2>Account Information</h2>
              <form onSubmit={handleUpdateAccount} className="form-group-container">
                <div className="form-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {accountMessage && <p className="success-text">{accountMessage}</p>}
                {accountError && <p className="error">{accountError}</p>}
                <button type="submit" className="btn btn-primary" disabled={updatingAccount}>
                  {updatingAccount ? 'Saving...' : 'Save Details'}
                </button>
              </form>
            </div>
          )}

          {/* Profile & Banner Tab */}
          {activeTab === 'assets' && (
            <div className="tab-pane">
              <h2>Profile Visual Assets</h2>

              {/* Avatar Form */}
              <form onSubmit={handleAvatarUpload} className="form-group-container asset-form">
                <h3>Update Avatar</h3>
                {user?.avatar && (
                  <div className="preview-image-box">
                    <img src={user.avatar} alt="Current avatar" className="avatar-md" />
                  </div>
                )}
                <div className="form-field">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                    required
                  />
                </div>
                {avatarMessage && <p className="success-text">{avatarMessage}</p>}
                {avatarError && <p className="error">{avatarError}</p>}
                <button type="submit" className="btn btn-primary" disabled={uploadingAvatar || !avatarFile}>
                  {uploadingAvatar ? 'Uploading...' : 'Update Avatar'}
                </button>
              </form>

              <hr className="divider" />

              {/* Cover Image Form */}
              <form onSubmit={handleCoverUpload} className="form-group-container asset-form">
                <h3>Update Channel Banner</h3>
                {user?.coverImage && (
                  <div className="preview-image-box cover-preview">
                    <img src={user.coverImage} alt="Current cover banner" />
                  </div>
                )}
                <div className="form-field">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files[0])}
                    required
                  />
                </div>
                {coverMessage && <p className="success-text">{coverMessage}</p>}
                {coverError && <p className="error">{coverError}</p>}
                <button type="submit" className="btn btn-primary" disabled={uploadingCover || !coverFile}>
                  {uploadingCover ? 'Uploading...' : 'Update Banner'}
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-pane">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordChange} className="form-group-container">
                <div className="form-field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                {passwordMessage && <p className="success-text">{passwordMessage}</p>}
                {passwordError && <p className="error">{passwordError}</p>}
                <button type="submit" className="btn btn-primary" disabled={updatingPassword}>
                  {updatingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
