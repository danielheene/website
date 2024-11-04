import { AppConfig } from '@lib/types';
import { log } from 'next-axiom';

export const isBrowser = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

export const isServer = !isBrowser;
export const isProd = process.env.NODE_ENV === 'production';
export const isDev = process.env.NODE_ENV !== 'production';

export const Routes = Object.seal({
  Config: process.env.NEXT_PUBLIC_SITE_URL + '/api/config',
});

export const fetchAppConfig = async (): Promise<AppConfig> => {
  log.debug('fetching app config...');

  try {
    const response = await fetch(Routes.Config);
    const appConfig = await response.json();
    log.debug('successful fetched config!');
    return appConfig ?? null;
  } catch (e) {
    log.error(e);
  }
};

export const resolvePathFromSlug = (slug: string, type: string) => {
  if (type.startsWith('singleton.')) return `/${slug}`;
  if (type.startsWith('blog.')) return `/blog/${slug}`;
  if (type.startsWith('projects.')) return `/projects/${slug}`;
};

export const resolveReferenceUrl = ({ _id, _type, slug }) =>
  resolvePathFromSlug(slug, _type);
