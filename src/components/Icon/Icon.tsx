import { Icon as IconifyIconComponent } from '@iconify-icon/react'
import React, { ComponentProps, JSX, memo } from 'react'

export const BRAND_ICON = {
  REACT: 'simple-icons:react',
  VERCEL: 'simple-icons:vercel',
  SANITY: 'simple-icons:sanity',
  PAYLOAD: 'simple-icons:payload',
  NEXTJS: 'simple-icons:nextjs',
  NAMECHEAP: 'simple-icons:namecheap',
  MAIL: 'simple-icons:mail',
  WEBSTORM: 'simple-icons:webstorm',
  INTELLIJ: 'simple-icons:intellij',
  GITHUB: 'simple-icons:github',
  FIGMA: 'simple-icons:figma',
  WHATSAPP: 'simple-icons:whatsapp',
  WIREGUARD: 'simple-icons:wireguard',
  ZIGBEE: 'simple-icons:zigbee',
  JAVASCRIPT: 'simple-icons:javascript',
  NODEJS: 'simple-icons:nodejs',
  UNSPLASH: 'simple-icons:unsplash',
  STORYBOOK: 'simple-icons:storybook',
  TAILSCALE: 'simple-icons:tailscale',
  RUST: 'simple-icons:rust',
  CLOUDFLARE: 'simple-icons:cloudflare',
  CLOUDFLARE_WORKERS: 'simple-icons:cloudflareworkers',
  CLOUDFLARE_PAGES: 'simple-icons:cloudflarepages',
  GITHUB_PAGES: 'simple-icons:githubpages',
  GITHUB_ACTIONS: 'simple-icons:githubactions',
  GITLAB: 'simple-icons:gitlab',
  HOME_ASSISTANT: 'simple-icons:homeassistant',
  SYNOLOGY: 'simple-icons:synology',
  ONE_PASSWORD: 'simple-icons:1password',
  JETBRAINS: 'simple-icons:jetbrains',
  PYCHARM: 'simple-icons:pycharm',
  PHPSTORM: 'simple-icons:phpstorm',
  GOLAND: 'simple-icons:goland',
  KUBERNETES: 'simple-icons:kubernetes',
  DOCKER: 'simple-icons:docker',
  RANCHER: 'simple-icons:rancher',
  LINUX: 'simple-icons:linux',
  LINKEDIN: 'simple-icons:linkedin',
  DEBIAN: 'simple-icons:debian',
  UBUNTU: 'simple-icons:ubuntu',
  ARCHLINUX: 'simple-icons:archlinux',
} as const

export const SIDEBAR_ICON = {
  RESUME_ABOUT_ME: 'material-symbols:fingerprint-sharp',
  RESUME_EXPERIENCE: 'material-symbols:work-outline-sharp',
  RESUME_PROJECTS: 'material-symbols:experiment-outline-sharp',
  RESUME_CUSTOMERS: 'material-symbols:deployed-code-account-outline-sharp',
  RESUME_CONTACT: 'material-symbols:stacked-email-outline-sharp',
  RESUME_DOWNLOADS: 'material-symbols:picture-as-pdf-outline-sharp',
  BLOG_POSTS: 'material-symbols:post-outline',
  BLOG_CATEGORIES: 'material-symbols:contextual-token-outline-sharp',
  BLOG_TAGS: 'material-symbols:label-outline-sharp',
  MEDIA_IMAGES: 'material-symbols:animated-images-outline-sharp',
  PAGES: 'material-symbols:pages-outline-sharp',
  USERS: 'material-symbols:account-box-outline-sharp',
  SETTINGS_USER_DATA: 'material-symbols:settings-account-box-sharp',
  SETTINGS_HEADER: 'material-symbols:page-header-outline-sharp',
  SETTINGS_FOOTER: 'material-symbols:page-footer-outline-sharp',
  SETTINGS_META: 'material-symbols:map-search-outline-sharp',
} as const

export const UI_ICON = {
  ERROR: 'material-symbols:error',
  WARNING: 'material-symbols:warning',
  INFO: 'material-symbols:info',
  SUCCESS: 'material-symbols:check-circle',
  PAUSE: 'material-symbols:pause',
  PLAY: 'material-symbols:play',
  STOP: 'material-symbols:stop',
  REPEAT: 'material-symbols:repeat',
  REPLAY: 'material-symbols:replay',
  ATTACH: 'material-symbols:attach-file',
  SETTINGS: 'material-symbols:settings',
  CALENDAR: 'material-symbols:calendar',
  ARROW_DOWNWARD: 'material-symbols:arrow-downward',
  ARROW_FORWARD: 'material-symbols:arrow-forward',
  CLOSE: 'material-symbols:close',
  IMAGE: 'material-symbols:image-outline-sharp',
} as const

export const ICON = { ...BRAND_ICON, ...SIDEBAR_ICON, ...UI_ICON } as const

export type IconName = (typeof ICON)[keyof typeof ICON]

export type IconProps = ComponentProps<typeof IconifyIconComponent> & {
  icon: IconName | string
}

export const Icon = memo(({ icon, ...iconBaseProps }: IconProps): JSX.Element => {
  return <IconifyIconComponent icon={icon} {...iconBaseProps} />
})
