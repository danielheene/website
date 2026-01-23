import React, { JSX, memo, useMemo } from 'react'
import {
  MdArrowDownward as ArrowDownwardIcon,
  MdArrowForward as ArrowForwardIcon,
  MdAttachFile as AttachIcon,
  MdCalendarMonth as CalendarIcon,
  MdCheckCircle as SuccessIcon,
  MdClose as CloseIcon,
  MdError as ErrorIcon,
  MdInfo as InfoIcon,
  MdOutlineImage as ImageIcon,
  MdPause as PauseIcon,
  MdPlayArrow as PlayIcon,
  MdRepeat as RepeatIcon,
  MdReplay as ReplayIcon,
  MdSettings as SettingsIcon,
  MdStop as StopIcon,
  MdWarning as WarningIcon,
} from 'react-icons/md'
import {
  Si1Password as OnePasswordIcon,
  SiArchlinux as ArchlinuxIcon,
  SiCloudflare as CloudflareIcon,
  SiCloudflarepages as CloudflarePagesIcon,
  SiCloudflareworkers as CloudflareWorkersIcon,
  SiDebian as DebianIcon,
  SiDocker as DockerIcon,
  SiFigma as FigmaIcon,
  SiGithub as GitHubIcon,
  SiGithubactions as GithubActionsIcon,
  SiGithubpages as GithubPagesIcon,
  SiGitlab as GitlabIcon,
  SiGoland as GolandIcon,
  SiHomeassistant as HomeassistantIcon,
  SiIntellijidea as IntellijIcon,
  SiJavascript as JavascriptIcon,
  SiJetbrains as JetbrainsIcon,
  SiKubernetes as KubernetesIcon,
  SiLinkedin as LinkedinIcon,
  SiLinux as LinuxIcon,
  SiMaildotru as MailIcon,
  SiNamecheap as NamecheapIcon,
  SiNextdotjs as NextjsIcon,
  SiNodedotjs as NodejsIcon,
  SiPayloadcms as PayloadIcon,
  SiPhpstorm as PhpstormIcon,
  SiPycharm as PycharmIcon,
  SiRancher as RancherIcon,
  SiReact as ReactIcon,
  SiRust as RustIcon,
  SiSanity as SanityIcon,
  SiStorybook as StorybookIcon,
  SiSynology as SynologyIcon,
  SiTailscale as TailscaleIcon,
  SiUbuntu as UbuntuIcon,
  SiUnsplash as UnsplashIcon,
  SiVercel as VercelIcon,
  SiWebstorm as WebstormIcon,
  SiWhatsapp as WhatsappIcon,
  SiWireguard as WireguardIcon,
  SiZigbee as ZigbeeIcon,
} from 'react-icons/si'

import type { IconBaseProps } from 'react-icons'

export const BRAND_ICONS = {
  REACT: 'react',
  VERCEL: 'vercel',
  SANITY: 'sanity',
  PAYLOAD: 'payload',
  NEXTJS: 'nextjs',
  NAMECHEAP: 'namecheap',
  MAIL: 'mail',
  WEBSTORM: 'webstorm',
  INTELLIJ: 'intellij',
  GITHUB: 'github',
  FIGMA: 'figma',
  WHATSAPP: 'whatsapp',
  WIREGUARD: 'wireguard',
  ZIGBEE: 'zigbee',
  JAVASCRIPT: 'javascript',
  NODEJS: 'nodejs',
  UNSPLASH: 'unsplash',
  STORYBOOK: 'storybook',
  TAILSCALE: 'tailscale',
  RUST: 'rust',
  CLOUDFLARE: 'cloudflare',
  CLOUDFLARE_WORKERS: 'cloudflare-workers',
  CLOUDFLARE_PAGES: 'cloudflare-pages',
  GITHUB_PAGES: 'github-pages',
  GITHUB_ACTIONS: 'github-actions',
  GITLAB: 'gitlab',
  HOMEASSISTANT: 'homeassistant',
  SYNOLOGY: 'synology',
  ONE_PASSWORD: 'one-password',
  JETBRAINS: 'jetbrains',
  PYCHARM: 'pycharm',
  PHPSTORM: 'phpstorm',
  GOLAND: 'goland',
  KUBERNETES: 'kubernetes',
  DOCKER: 'docker',
  RANCHER: 'rancher',
  LINUX: 'linux',
  LINKEDIN: 'linkedin',
  DEBIAN: 'debian',
  UBUNTU: 'ubuntu',
  ARCHLINUX: 'archlinux',
} as const

export const UI_ICONS = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success',
  PAUSE: 'pause',
  PLAY: 'play',
  STOP: 'stop',
  REPEAT: 'repeat',
  REPLAY: 'replay',
  ATTACH: 'attach',
  SETTINGS: 'settings',
  CALENDAR: 'calendar',
  ARROW_DOWNWARD: 'arrow-downward',
  ARROW_FORWARD: 'arrow-forward',
  CLOSE: 'close',
  IMAGE: 'image',
} as const

export const ICON_NAME = {
  ...BRAND_ICONS,
  ...UI_ICONS,
} as const

export type IconName = `${(typeof ICON_NAME)[keyof typeof ICON_NAME]}`

export interface IconProps extends IconBaseProps {
  name: IconName
}

export const Icon = memo(({ name, ...iconBaseProps }: IconProps): JSX.Element => {
  const Component = useMemo(() => {
    switch (name) {
      case ICON_NAME.CALENDAR:
        return CalendarIcon
      case ICON_NAME.SUCCESS:
        return SuccessIcon
      case ICON_NAME.WARNING:
        return WarningIcon
      case ICON_NAME.INFO:
        return InfoIcon
      case ICON_NAME.ERROR:
        return ErrorIcon
      case ICON_NAME.REACT:
        return ReactIcon
      case ICON_NAME.VERCEL:
        return VercelIcon
      case ICON_NAME.SANITY:
        return SanityIcon
      case ICON_NAME.PAYLOAD:
        return PayloadIcon
      case ICON_NAME.NEXTJS:
        return NextjsIcon
      case ICON_NAME.NAMECHEAP:
        return NamecheapIcon
      case ICON_NAME.WEBSTORM:
        return WebstormIcon
      case ICON_NAME.INTELLIJ:
        return IntellijIcon
      case ICON_NAME.GITHUB:
        return GitHubIcon
      case ICON_NAME.FIGMA:
        return FigmaIcon
      case ICON_NAME.WHATSAPP:
        return WhatsappIcon
      case ICON_NAME.WIREGUARD:
        return WireguardIcon
      case ICON_NAME.ZIGBEE:
        return ZigbeeIcon
      case ICON_NAME.JAVASCRIPT:
        return JavascriptIcon
      case ICON_NAME.NODEJS:
        return NodejsIcon
      case ICON_NAME.UNSPLASH:
        return UnsplashIcon
      case ICON_NAME.STORYBOOK:
        return StorybookIcon
      case ICON_NAME.TAILSCALE:
        return TailscaleIcon
      case ICON_NAME.RUST:
        return RustIcon
      case ICON_NAME.CLOUDFLARE:
        return CloudflareIcon
      case ICON_NAME.CLOUDFLARE_WORKERS:
        return CloudflareWorkersIcon
      case ICON_NAME.CLOUDFLARE_PAGES:
        return CloudflarePagesIcon
      case ICON_NAME.GITHUB_PAGES:
        return GithubPagesIcon
      case ICON_NAME.GITHUB_ACTIONS:
        return GithubActionsIcon
      case ICON_NAME.GITLAB:
        return GitlabIcon
      case ICON_NAME.HOMEASSISTANT:
        return HomeassistantIcon
      case ICON_NAME.SYNOLOGY:
        return SynologyIcon
      case ICON_NAME.ONE_PASSWORD:
        return OnePasswordIcon
      case ICON_NAME.JETBRAINS:
        return JetbrainsIcon
      case ICON_NAME.PYCHARM:
        return PycharmIcon
      case ICON_NAME.PHPSTORM:
        return PhpstormIcon
      case ICON_NAME.GOLAND:
        return GolandIcon
      case ICON_NAME.KUBERNETES:
        return KubernetesIcon
      case ICON_NAME.DOCKER:
        return DockerIcon
      case ICON_NAME.RANCHER:
        return RancherIcon
      case ICON_NAME.LINUX:
        return LinuxIcon
      case ICON_NAME.LINKEDIN:
        return LinkedinIcon
      case ICON_NAME.MAIL:
        return MailIcon
      case ICON_NAME.DEBIAN:
        return DebianIcon
      case ICON_NAME.UBUNTU:
        return UbuntuIcon
      case ICON_NAME.ARCHLINUX:
        return ArchlinuxIcon
      case ICON_NAME.PAUSE:
        return PauseIcon
      case ICON_NAME.PLAY:
        return PlayIcon
      case ICON_NAME.STOP:
        return StopIcon
      case ICON_NAME.REPEAT:
        return RepeatIcon
      case ICON_NAME.REPLAY:
        return ReplayIcon
      case ICON_NAME.ATTACH:
        return AttachIcon
      case ICON_NAME.SETTINGS:
        return SettingsIcon
      case ICON_NAME.ARROW_DOWNWARD:
        return ArrowDownwardIcon
      case ICON_NAME.ARROW_FORWARD:
        return ArrowForwardIcon
      case ICON_NAME.CLOSE:
        return CloseIcon
      case ICON_NAME.IMAGE:
        return ImageIcon
      default:
        return React.Fragment
    }
  }, [name])

  return <Component {...iconBaseProps} />
})

Icon.displayName = 'Icon'
