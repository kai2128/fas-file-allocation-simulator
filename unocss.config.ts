import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { presetScrollbar } from 'unocss-preset-scrollbar'

export default defineConfig({
  shortcuts: [
    ['btn', 'flex items-center px-2 py-1 rounded bg-#f0f1f4 outline-black text-black cursor-pointer outline-300 hover:bg-gray-300 disabled:cursor-default disabled:bg-gray-300'],
    ['icon-btn', 'text-2xl text-gray hover:text-cool-gray-700 inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 disabled:text-cool-gray-300 disabled:hover:text-cool-gray-300'],
  ],
  presets: [
    presetUno(),
    presetScrollbar(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
        inter: 'Inter',
      },
    }),
  ],
  rules: [
    [/^area-\[(.*)\]$/, ([, c]) => ({ 'grid-area': `${c}` })],
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  safelist: 'prose prose-sm m-auto text-left'.split(' '),
})
