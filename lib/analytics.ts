export const analyticsConfig = {
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || undefined,
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined,
} as const

export function isGoogleAnalyticsEnabled(): boolean {
  return process.env.NODE_ENV === 'production' && Boolean(analyticsConfig.gaMeasurementId)
}

export function isGoogleSearchConsoleEnabled(): boolean {
  return Boolean(analyticsConfig.googleSiteVerification)
}
