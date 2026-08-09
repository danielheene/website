'use client'

import { type ComponentPropsWithoutRef, forwardRef, type JSX } from 'react'

import { addAPIProvider, IconifyIcon, Icon as IconifyIconComponent } from '@iconify/react'

addAPIProvider('', {
  resources: [
    'https://icons.heene.io',
  ],
})

export const BRAND_ICON = {
  archlinux: 'simple-icons:archlinux',
  cloudflare: 'simple-icons:cloudflare',
  'cloudflare-pages': 'simple-icons:cloudflarepages',
  'cloudflare-workers': 'simple-icons:cloudflareworkers',
  debian: 'simple-icons:debian',
  docker: 'simple-icons:docker',
  figma: 'simple-icons:figma',
  github: 'simple-icons:github',
  'github-actions': 'simple-icons:githubactions',
  'github-pages': 'simple-icons:githubpages',
  gitlab: 'simple-icons:gitlab',
  goland: 'simple-icons:goland',
  'home-assistant': 'simple-icons:homeassistant',
  intellij: 'simple-icons:intellijidea',
  javascript: 'simple-icons:javascript',
  jetbrains: 'simple-icons:jetbrains',
  kubernetes: 'simple-icons:kubernetes',
  linkedin: 'simple-icons:linkedin',
  linux: 'simple-icons:linux',
  mail: 'simple-icons:maildotru',
  phone: 'material-symbols:call',
  namecheap: 'simple-icons:namecheap',
  'next-js': 'simple-icons:nextdotjs',
  'node-js': 'simple-icons:nodedotjs',
  'one-password': 'simple-icons:1password',
  payload: 'simple-icons:payloadcms',
  phpstorm: 'simple-icons:phpstorm',
  pycharm: 'simple-icons:pycharm',
  rancher: 'simple-icons:rancher',
  react: 'simple-icons:react',
  rust: 'simple-icons:rust',
  sanity: 'simple-icons:sanity',
  storybook: 'simple-icons:storybook',
  synology: 'simple-icons:synology',
  tailscale: 'simple-icons:tailscale',
  ubuntu: 'simple-icons:ubuntu',
  unsplash: 'simple-icons:unsplash',
  vercel: 'simple-icons:vercel',
  webstorm: 'simple-icons:webstorm',
  whatsapp: 'simple-icons:whatsapp',
  wireguard: 'simple-icons:wireguard',
  xing: 'simple-icons:xing',
  zigbee: 'simple-icons:zigbee',
} as const

export const UI_ICON = {
  error: 'material-symbols:error',
  warning: 'material-symbols:warning',
  info: 'material-symbols:info',
  success: 'material-symbols:check-circle',
  call: 'material-symbols:call',
  pause: 'material-symbols:pause',
  play: 'material-symbols:play-arrow',
  stop: 'material-symbols:stop',
  repeat: 'material-symbols:repeat',
  replay: 'material-symbols:replay',
  attach: 'material-symbols:attach-file',
  settings: 'material-symbols:settings',
  calendar: 'material-symbols:calendar-month',
  'arrow-down': 'material-symbols:keyboard-arrow-down',
  'arrow-up': 'material-symbols:keyboard-arrow-up',
  'arrow-left': 'material-symbols:keyboard-arrow-left',
  'arrow-right': 'material-symbols:keyboard-arrow-right',
  'trending-up': 'material-symbols:trending-up',
  'trending-down': 'material-symbols:trending-down',
  'trending-flat': 'material-symbols:trending-flat',
  'touch-app': 'material-symbols:touch-app',
  person: 'material-symbols:person',
  group: 'material-symbols:group',
  'mouse-cursor': 'material-symbols:highlight-mouse-cursor',
  undo: 'material-symbols:undo',
  close: 'material-symbols:close',
  plus: 'material-symbols:add',
  minus: 'material-symbols:remove',
  image: 'material-symbols:image-outline-sharp',
  logout: 'material-symbols:logout-sharp',
} as const

export const ICON = {
  ...BRAND_ICON,
  ...UI_ICON,
} as const

export type IconName = keyof typeof ICON

export type IconProps = Omit<
  ComponentPropsWithoutRef<typeof IconifyIconComponent>,
  'icon' | 'width' | 'height' | 'size' | 'name'
> & {
  name: IconName | string
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, ...iconBaseProps }, ref): JSX.Element => {
    const icon = ICON[name] ?? name
    return <IconifyIconComponent ref={ref} icon={icon} {...iconBaseProps} />
  },
)
