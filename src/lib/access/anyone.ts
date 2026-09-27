import type { Access } from 'payload'

/**
 * Access control function that grants unrestricted access to all users.
 */
export const anyone: Access = () => true
