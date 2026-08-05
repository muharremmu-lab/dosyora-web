export const designTokens = {
  colors: {
    primary: 'var(--ds-color-primary)',
    secondary: 'var(--ds-color-secondary)',
    accent: 'var(--ds-color-accent)',
    success: 'var(--ds-color-success)',
    warning: 'var(--ds-color-warning)',
    danger: 'var(--ds-color-danger)',
    surface: 'var(--ds-color-surface)',
    surfaceAlt: 'var(--ds-color-surface-alt)',
    border: 'var(--ds-color-border)',
    text: 'var(--ds-color-text)',
    textMuted: 'var(--ds-color-text-muted)',
  },
  spacing: {
    1: 'var(--ds-space-1)',
    2: 'var(--ds-space-2)',
    3: 'var(--ds-space-3)',
    4: 'var(--ds-space-4)',
    6: 'var(--ds-space-6)',
    8: 'var(--ds-space-8)',
    12: 'var(--ds-space-12)',
    16: 'var(--ds-space-16)',
    24: 'var(--ds-space-24)',
  },
  radius: {
    sm: 'var(--ds-radius-sm)',
    md: 'var(--ds-radius-md)',
    lg: 'var(--ds-radius-lg)',
    xl: 'var(--ds-radius-xl)',
  },
  shadow: {
    sm: 'var(--ds-shadow-sm)',
    md: 'var(--ds-shadow-md)',
    lg: 'var(--ds-shadow-lg)',
  },
  typography: {
    display: 'ds-display',
    h1: 'ds-h1',
    h2: 'ds-h2',
    h3: 'ds-h3',
    bodyLg: 'ds-body-lg',
    body: 'ds-body',
    small: 'ds-small',
  },
  motion: {
    fade: 'ds-animate-fade',
    slideUp: 'ds-animate-slide-up',
    hover: 'ds-transition-hover',
    scale: 'ds-hover-scale',
  },
} as const

export type DesignTokenColors = keyof typeof designTokens.colors
