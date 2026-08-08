export const DEMO_DOCUMENT_LIMIT = 50

export const ACCOUNT_TYPES = ['DEMO', 'OWNER', 'INTERNAL', 'PAID'] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

export const ACTIVATION_STATUSES = ['PENDING', 'ACTIVATED', 'EXPIRED'] as const
export type ActivationStatus = (typeof ACTIVATION_STATUSES)[number]

export const PROVISION_STATUSES = ['PENDING', 'PROVISIONED', 'FAILED', 'LOCAL_ONLY'] as const
export type ProvisionStatus = (typeof PROVISION_STATUSES)[number]

export const LIFECYCLE_STATUSES = ['ACTIVE', 'ARCHIVED', 'DELETED'] as const
export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number]

export const ACTIVATION_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000
