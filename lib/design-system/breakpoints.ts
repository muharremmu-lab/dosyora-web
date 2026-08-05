export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const

export const breakpointQueries = {
  tablet: `(min-width: ${breakpoints.tablet}px)`,
  desktop: `(min-width: ${breakpoints.desktop}px)`,
} as const

export type BreakpointName = keyof typeof breakpoints
