/**
 * Generate a redirect URL for a resume document.
 */
export const generateResumeDocumentRedirectURL = (slug: string) => {
  return `${process.env.RESUME_REDIRECT_URL_BASE}/${slug.toLowerCase()}`
}
