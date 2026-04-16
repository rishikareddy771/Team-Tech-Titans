import { useMemo, useState } from 'react'

function ProfileSelection({ profiles, onCreateProfile, onSelectProfile, onDeleteProfile }) {
  const [profileName, setProfileName] = useState('')
  const canCreate = profileName.trim().length > 0

  const sortedProfiles = useMemo(
    () => [...profiles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [profiles],
  )

  return (
    <div className="profile-shell">
      <div className="profile-card">
        <div className="topbar__main">
          <p className="eyebrow">Money Talks</p>
          <h1>Create a profile to start budgeting</h1>
          <p className="topbar__subtitle">
            Add your name and save a profile. Then choose one to manage a separate
            budget workspace.
          </p>
        </div>

        <form
          className="profile-card__form"
          onSubmit={(event) => {
            event.preventDefault()
            if (canCreate) {
              onCreateProfile(profileName.trim())
              setProfileName('')
            }
          }}
        >
          <label htmlFor="profileName">Profile name</label>
          <input
            id="profileName"
            type="text"
            value={profileName}
            onChange={(event) => setProfileName(event.target.value)}
            placeholder="Enter your name"
          />

          <button
            className="ghost-button ghost-button--nav"
            type="submit"
            disabled={!canCreate}
          >
            Save profile
          </button>
        </form>

        {sortedProfiles.length > 0 && (
          <div className="profile-list">
            <h2>Existing profiles</h2>
            <p>Choose a profile to continue your budgeting journey.</p>
            <div className="profile-list__items">
              {sortedProfiles.map((profile) => (
                <div key={profile.id} className="profile-item">
                  <div>
                    <strong>{profile.name}</strong>
                    <small>
                      Created {new Date(profile.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="profile-item__actions">
                    <button
                      className="ghost-button ghost-button--nav"
                      type="button"
                      onClick={() => onSelectProfile(profile.id)}
                    >
                      Continue
                    </button>
                    <button
                      className="ghost-button ghost-button--danger"
                      type="button"
                      onClick={() => onDeleteProfile(profile.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileSelection
