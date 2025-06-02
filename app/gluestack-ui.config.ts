import { createConfig } from '@gluestack-ui/themed';

export const config = createConfig({
  tokens: {
    colors: {
      primary: '#0ea5e9',
      secondary: '#64748b',
      error: '#ef4444',
      background: '#f8fafc',
    },
  },
  components: {
    Button: {
      theme: {
        variants: {
          solid: {
            bg: '$primary',
            borderRadius: '$md',
          },
        },
      },
    },
    Input: {
      theme: {
        variants: {
          default: {
            bg: 'white',
            borderRadius: '$md',
          },
        },
      },
    },
  },
}); 