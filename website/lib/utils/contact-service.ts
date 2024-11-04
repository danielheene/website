import { ContactProvider, ContactItem } from '@lib/types';

const CONTACT_SERVICES: ContactItem[] = [
  {
    name: 'github',
    label: 'GitHub',
    urlPrefix: 'https://github.com/',
    icon: 'simple-icons:github',
  },
  {
    name: 'whatsapp',
    label: 'WhatsApp',
    urlPrefix: 'https://wa.me/',
    icon: 'simple-icons:whatsapp',
  },
  {
    name: 'instagram',
    label: 'Instagram',
    urlPrefix: 'https://www.instagram.com/',
    icon: 'simple-icons:instagram',
  },
  {
    name: 'discord',
    label: 'Discord',
    urlPrefix: 'https://discord.com/users/',
    icon: 'simple-icons:discord',
  },
  {
    name: 'mail',
    label: 'Mail',
    urlPrefix: 'mailto:',
    icon: 'simple-icons:maildotru',
  },
  {
    name: 'phone',
    label: 'Phone',
    urlPrefix: 'tel:',
    icon: 'carbon:phone-filled',
  },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    urlPrefix: 'https://www.linkedin.com/in/',
    icon: 'simple-icons:linkedin',
  },
  {
    name: 'xing',
    label: 'Xing',
    urlPrefix: 'https://www.xing.com/profile/',
    icon: 'simple-icons:xing',
  },
];

export const resolveContactItem = (
  service: ContactProvider
): ContactItem => {
  return CONTACT_SERVICES.find((s) => s.name === service);
};
