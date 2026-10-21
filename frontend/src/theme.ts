import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import { themeQuartz } from 'ag-grid-community'

const palette = (name: string) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => [
      shade,
      `{${name}.${shade}}`,
    ]),
  )

// White on sky-500 is 2.8:1 and on sky-600 4.1:1; sky-700 (5.9:1) clears WCAG AA for button text.
export const primePreset = definePreset(Aura, {
  semantic: {
    primary: palette('sky'),
    colorScheme: {
      light: {
        primary: {
          color: '{primary.700}',
          hoverColor: '{primary.800}',
          activeColor: '{primary.900}',
        },
      },
    },
  },
})

// The grid reads PrimeVue's CSS variables so both libraries share one palette.
export const gridTheme = themeQuartz.withParams({
  accentColor: 'var(--p-primary-color)',
  backgroundColor: 'var(--p-surface-0)',
  foregroundColor: 'var(--p-surface-700)',
  borderColor: 'var(--p-surface-200)',
  headerBackgroundColor: 'var(--p-surface-50)',
  headerTextColor: 'var(--p-surface-500)',
  oddRowBackgroundColor: 'var(--p-surface-50)',
  fontFamily: 'inherit',
  fontSize: 13,
  headerFontWeight: 600,
  borderRadius: 8,
  wrapperBorderRadius: 12,
  spacing: 7,
})
