// Génère les icônes PWA : médaillon doré en relief, monogramme "M" en New Rocker (Google Fonts).
// Rendu façon "flaticon" (dégradés, ombre portée, reliefs).
// Le texte custom nécessite resvg (contrairement à librsvg utilisé par sharp, il charge une police locale explicitement).
import { Resvg } from '@resvg/resvg-js'
import { mkdirSync, writeFileSync } from 'node:fs'

const FONT_FILE = 'node_modules/@expo-google-fonts/new-rocker/400Regular/NewRocker_400Regular.ttf'
const FONT_FAMILY = 'New Rocker'

function coinSvg(bgRect) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="15%" r="90%">
      <stop offset="0" stop-color="#1a2e52"/>
      <stop offset="0.75" stop-color="#08111f"/>
    </radialGradient>
    <radialGradient id="dome" cx="34%" cy="26%" r="85%">
      <stop offset="0" stop-color="#fff4cf"/>
      <stop offset="0.38" stop-color="#f3d892"/>
      <stop offset="0.72" stop-color="#d2a157"/>
      <stop offset="1" stop-color="#a97c33"/>
    </radialGradient>
    <linearGradient id="letter" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff2cf"/>
      <stop offset="0.5" stop-color="#eecb7f"/>
      <stop offset="1" stop-color="#b98a3e"/>
    </linearGradient>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2.5"/>
    </filter>
    <filter id="lift" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur"/>
      <feOffset in="blur" dx="0" dy="14" result="off"/>
      <feComponentTransfer in="off" result="shadow"><feFuncA type="linear" slope="0.45"/></feComponentTransfer>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  ${bgRect}

  <g filter="url(#lift)">
    <!-- tranche de la pièce (épaisseur) -->
    <circle cx="256" cy="263" r="196" fill="#7e5f27"/>
    <!-- face bombée -->
    <circle cx="256" cy="253" r="194" fill="url(#dome)"/>
    <circle cx="256" cy="253" r="194" fill="none" stroke="#fff6df" stroke-opacity="0.3" stroke-width="2"/>
    <circle cx="256" cy="253" r="168" fill="none" stroke="#8a6a2e" stroke-opacity="0.35" stroke-width="2"/>
  </g>

  <!-- monogramme "M" (New Rocker), relief discret -->
  <g font-family="${FONT_FAMILY}" font-size="208" text-anchor="middle">
    <text x="256" y="327" fill="none" stroke="#4a3015" stroke-opacity="0.4" stroke-width="5" paint-order="stroke fill">M</text>
    <text x="259" y="331" fill="#5a4015" fill-opacity="0.35" filter="url(#soft)">M</text>
    <text x="253" y="323" fill="#fff6df" fill-opacity="0.7">M</text>
    <text x="256" y="327" fill="url(#letter)">M</text>
  </g>
</svg>`
}

mkdirSync('public', { recursive: true })

const svg = coinSvg('<rect width="512" height="512" fill="url(#bg)"/>')
const maskableSvg = coinSvg('<rect width="512" height="512" fill="url(#bg)"/>')
  .replace('viewBox="0 0 512 512"', 'viewBox="-96 -96 704 704"')
  .replace('<rect width="512" height="512" fill="url(#bg)"/>', '<rect x="-96" y="-96" width="704" height="704" fill="url(#bg)"/>')

function render(source, size, outPath) {
  const r = new Resvg(source, {
    fitTo: { mode: 'width', value: size },
    font: { fontFiles: [FONT_FILE], loadSystemFonts: false, defaultFontFamily: FONT_FAMILY },
  })
  writeFileSync(outPath, r.render().asPng())
  console.log('écrit', outPath)
}

render(svg, 192, 'public/pwa-192.png')
render(svg, 512, 'public/pwa-512.png')
render(svg, 180, 'public/apple-touch-icon.png')
render(svg, 32, 'public/favicon-32.png')
render(maskableSvg, 512, 'public/pwa-maskable-512.png')
