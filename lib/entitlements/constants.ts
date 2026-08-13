export const DEMO_DOCUMENT_LIMIT = 20

/** Runtime demo quota per IP attempt: 1st → 20, 2nd → 10, 3rd → 5, 4th+ → denied */
export const DEMO_RUNTIME_LIMITS = [20, 10, 5] as const

export const DEMO_MAX_FREE_ATTEMPTS = DEMO_RUNTIME_LIMITS.length

export const ACCOUNT_TYPES = ['DEMO', 'OWNER', 'INTERNAL', 'PAID'] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

export const ACTIVATION_STATUSES = ['PENDING', 'ACTIVATED', 'EXPIRED'] as const
export type ActivationStatus = (typeof ACTIVATION_STATUSES)[number]

export const PROVISION_STATUSES = ['PENDING', 'PROVISIONED', 'FAILED', 'LOCAL_ONLY', 'INQUIRY'] as const
export type ProvisionStatus = (typeof PROVISION_STATUSES)[number]

export const LIFECYCLE_STATUSES = ['ACTIVE', 'ARCHIVED', 'DELETED'] as const
export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number]

export const ACTIVATION_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000
