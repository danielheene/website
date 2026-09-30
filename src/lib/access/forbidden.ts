import { Access } from 'payload'

/**
 * A predefined access control function that always denies access.
 */
export const forbidden: Access = () => false
