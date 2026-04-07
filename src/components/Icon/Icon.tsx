import { addAPIProvider, Icon as IconifyIconComponent } from '@iconify-icon/react'
import { type ComponentProps, type JSX, memo } from 'react'

addAPIProvider('', {
  resources: ['https://icons.heene.io'],
})

export const BRAND_ICON = {
  ARCHLINUX: 'simple-icons:archlinux',
  CLOUDFLARE: 'simple-icons:cloudflare',
  CLOUDFLARE_PAGES: 'simple-icons:cloudflarepages',
  CLOUDFLARE_WORKERS: 'simple-icons:cloudflareworkers',
  DEBIAN: 'simple-icons:debian',
  DOCKER: 'simple-icons:docker',
  FIGMA: 'simple-icons:figma',
  GITHUB: 'simple-icons:github',
  GITHUB_ACTIONS: 'simple-icons:githubactions',
  GITHUB_PAGES: 'simple-icons:githubpages',
  GITLAB: 'simple-icons:gitlab',
  GOLAND: 'simple-icons:goland',
  HOME_ASSISTANT: 'simple-icons:homeassistant',
  INTELLIJ: 'simple-icons:intellijidea',
  JAVASCRIPT: 'simple-icons:javascript',
  JETBRAINS: 'simple-icons:jetbrains',
  KUBERNETES: 'simple-icons:kubernetes',
  LINKEDIN: 'simple-icons:linkedin',
  LINUX: 'simple-icons:linux',
  MAIL: 'simple-icons:maildotru',
  NAMECHEAP: 'simple-icons:namecheap',
  NEXTJS: 'simple-icons:nextdotjs',
  NODEJS: 'simple-icons:nodedotjs',
  ONE_PASSWORD: 'simple-icons:1password',
  PAYLOAD: 'simple-icons:payloadcms',
  PHPSTORM: 'simple-icons:phpstorm',
  PYCHARM: 'simple-icons:pycharm',
  RANCHER: 'simple-icons:rancher',
  REACT: 'simple-icons:react',
  RUST: 'simple-icons:rust',
  SANITY: 'simple-icons:sanity',
  STORYBOOK: 'simple-icons:storybook',
  SYNOLOGY: 'simple-icons:synology',
  TAILSCALE: 'simple-icons:tailscale',
  UBUNTU: 'simple-icons:ubuntu',
  UNSPLASH: 'simple-icons:unsplash',
  VERCEL: 'simple-icons:vercel',
  WEBSTORM: 'simple-icons:webstorm',
  WHATSAPP: 'simple-icons:whatsapp',
  WIREGUARD: 'simple-icons:wireguard',
  XING: 'simple-icons:xing',
  ZIGBEE: 'simple-icons:zigbee',
} as const

export const SIDEBAR_ICON = {
  BLOG_CATEGORIES: 'material-symbols:contextual-token-outline-sharp',
  BLOG_POSTS: 'material-symbols:post-outline',
  BLOG_TAGS: 'material-symbols:label-outline-sharp',
  MEDIA_IMAGES: 'material-symbols:contact-page-outline-sharp',
  MEDIA_VIDEOS: 'material-symbols:video-file-outline-sharp',
  MEDIA_AUDIOS: 'material-symbols:audio-file-outline-sharp',
  MEDIA_DOCUMENTS: 'material-symbols:picture-as-pdf-outline-sharp',
  PAGES: 'material-symbols:pages-outline-sharp',
  RESUME_ABOUT_ME: 'material-symbols:fingerprint-sharp',
  RESUME_CONTACT: 'material-symbols:stacked-email-outline-sharp',
  RESUME_CUSTOMERS: 'material-symbols:deployed-code-account-outline-sharp',
  RESUME_DOWNLOADS: 'material-symbols:picture-as-pdf-outline-sharp',
  RESUME_EXPERIENCE: 'material-symbols:work-outline-sharp',
  RESUME_PROJECTS: 'material-symbols:experiment-outline-sharp',
  SETTINGS_FOOTER: 'material-symbols:page-footer-outline-sharp',
  SETTINGS_HEADER: 'material-symbols:page-header-outline-sharp',
  SETTINGS_META: 'material-symbols:map-search-outline-sharp',
  SETTINGS_USER_DATA: 'material-symbols:settings-account-box-sharp',
  USERS: 'material-symbols:account-box-outline-sharp',
} as const

export const UI_ICON = {
  ERROR: 'material-symbols:error',
  WARNING: 'material-symbols:warning',
  INFO: 'material-symbols:info',
  SUCCESS: 'material-symbols:check-circle',
  CALL: 'material-symbols:call',
  PAUSE: 'material-symbols:pause',
  PLAY: 'material-symbols:play-arrow',
  STOP: 'material-symbols:stop',
  REPEAT: 'material-symbols:repeat',
  REPLAY: 'material-symbols:replay',
  ATTACH: 'material-symbols:attach-file',
  SETTINGS: 'material-symbols:settings',
  CALENDAR: 'material-symbols:calendar-month',
  ARROW_DOWN: 'material-symbols:keyboard-arrow-down',
  ARROW_UP: 'material-symbols:keyboard-arrow-up',
  ARROW_LEFT: 'material-symbols:keyboard-arrow-left',
  ARROW_RIGHT: 'material-symbols:keyboard-arrow-right',
  TRENDING_UP: 'material-symbols:trending-up',
  TRENDING_DOWN: 'material-symbols:trending-down',
  TRENDING_FLAT: 'material-symbols:trending-flat',
  TOUCH_APP: 'material-symbols:touch-app',
  PERSON: 'material-symbols:person',
  GROUP: 'material-symbols:group',
  WEB_TRAFFIC: 'material-symbols:web-traffic',
  MOUSE_CURSOR: 'material-symbols:highlight-mouse-cursor',
  UNDO: 'material-symbols:undo',
  CLOCK: 'material-symbols:nest-clock-farsight-analog-outline',
  HAND_EYE: 'material-symbols:multimodal-hand-eye',
  CLOSE: 'material-symbols:close',
  IMAGE: 'material-symbols:image-outline-sharp',
  LOGOUT: 'material-symbols:logout-sharp',
} as const

export const ICON = { ...BRAND_ICON, ...SIDEBAR_ICON, ...UI_ICON } as const

export type IconName = (typeof ICON)[keyof typeof ICON]

export type IconProps = ComponentProps<typeof IconifyIconComponent> & {
  icon: IconName | string
}

export const Icon = memo(({ icon, ...iconBaseProps }: IconProps): JSX.Element => {
  return <IconifyIconComponent icon={icon} {...iconBaseProps} />
})
