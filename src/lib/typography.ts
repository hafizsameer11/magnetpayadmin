/** MagnetPay Hub typography — matches prototype (Inter UI + JetBrains Mono numerals). */
export const F = {
  sans: 'var(--mp-font-sans)',
  mono: 'var(--mp-font-mono)',
} as const;

export const sansStyle = { fontFamily: F.sans } as const;
export const monoStyle = { fontFamily: F.mono } as const;
