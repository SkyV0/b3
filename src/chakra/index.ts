import { extendTheme, theme as baseTheme } from '@chakra-ui/react'
import 'focus-visible/dist/focus-visible'
import * as components from './components'
import * as foundations from './foundations'

export const theme: Record<string, any> = extendTheme({
  ...baseTheme.colors,
  ...foundations,
  colors: { ...baseTheme.colors, brand: baseTheme.colors.purple,
    primaryFontColor: {
      lightMode: baseTheme.colors,
      darkMode: baseTheme.colors,
    },
    secondaryFontColor: {
      lightMode: baseTheme.colors,
      darkMode: baseTheme.colors,
    }},
  components: { ...components,},
  space: {
    '4.5': '1.125rem',
  },
})
