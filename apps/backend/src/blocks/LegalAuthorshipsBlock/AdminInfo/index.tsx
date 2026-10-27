import type { UIFieldServerComponent } from 'payload'

/**
 * Editor-facing placeholder. The block itself has no editable content — the
 * credits list is derived at render time from the media assets referenced
 * across the site.
 */
export const LegalAuthorshipsBlockAdminInfo: UIFieldServerComponent = () => (
  <div className="field-type">
    <p
      style={{
        margin: 0,
        opacity: 0.7,
      }}
    >
      Lists every media asset with a credit line that is used somewhere on the site, along with the
      pages it appears on. Generated automatically — nothing to configure.
    </p>
  </div>
)

export default LegalAuthorshipsBlockAdminInfo
