import { TypedObject } from '@sanity/types';
import { MetaTag } from 'next-seo/lib/types';

export type MetaDataResponse = {
  title?: string;
  titleTemplate?: string;
  metaDescription: string;
  metaKeywords: string[];
  metaTags: {
    type: 'name' | 'property' | 'httpEquiv';
    attribute?: string;
    value: string;
    content: string;
  }[];
};

export type MetaData = {
  title?: string;
  titleTemplate?: string;
  description: string;
  keywords: string[];
  tags: MetaTag[];
};

export interface AppConfigData {
  features: {
    hireMeWidget: boolean;
    easterEggWidget: boolean;
  };
  contact: ContactModuleData;
  assets: {
    resume: FileAssetFragment;
    publicKey: FileAssetFragment;
  };
  mainNavigation: Navigation;
  footerNavigation: Navigation;
  metaNavigation: Navigation;
}

export type ImagePalette = {
  readonly _type: 'sanity.imagePalette';

  darkMuted?: ImageSwatch;
  darkVibrant?: ImageSwatch;
  dominant?: ImageSwatch;
  lightMuted?: ImageSwatch;
  lightVibrant?: ImageSwatch;
  muted?: ImageSwatch;
  vibrant?: ImageSwatch;
};

export type ImageSwatch = {
  readonly _type: 'sanity.imagePaletteSwatch';

  background: string;
  foreground: string;
  population: number;
  title?: string;
};

export type ImageDimensions = {
  readonly _type: 'sanity.imageDimensions';
  height: number;
  width: number;
  aspectRatio: number;
};

export type FileAssetFragment = {
  readonly _id: string;
  readonly _rev: string;

  extension: string;
  mimeType: string;
  originalFilename: string;
  url: string;
  size: number;
} | null;

export type ImageAssetFragment = {
  readonly _type: 'image';
  readonly _id: string;
  readonly _rev: string;

  extension: string;
  mimeType: string;
  originalFilename: string;
  altText?: string;
  url: string;
  size: number;
  lqip: string;
  palette: ImagePalette;
  dimensions: ImageDimensions;
} | null;

export type TypographyVariant =
  | 'section-title'
  | 'section-subtitle'
  | 'section-caption'
  | 'body'
  | 'button-default'
  | 'button-primary'
  | 'button-outlined'
  | 'button-ghost';

export type NavigationItemVariant = 'external' | 'internal' | 'file';
export type NavigationItemMode = 'default' | 'primary' | 'ghost';

export type NavigationItem = {
  readonly _key: string;
  readonly _type: 'object.navigationItem';
} & (
  | {
      variant: 'external';
      label: string;
      mode: NavigationItemMode;
      url: string;
      blank: boolean;
      forceDownload: boolean;
    }
  | {
      variant: 'internal';
      label: string;
      mode: NavigationItemMode;
      url: string;
    }
  | {
      variant: 'file';
      label: string;
      mode: NavigationItemMode;
      url: string;
      originalFilename: string;
      forceDownload: boolean;
      blank: boolean;
    }
);

export type Navigation = {
  label: string;
  entries: NavigationItem[];
};

export type ContactProvider =
  | 'github'
  | 'whatsapp'
  | 'instagram'
  | 'discord'
  | 'mail'
  | 'phone'
  | 'linkedin'
  | 'xing';

export type ContactModuleData = Record<ContactProvider, string>;

export type ContactItem = {
  name: ContactProvider;
  label: string;
  urlPrefix: string;
  icon: string;
};

export type QualificationItemData = {
  readonly _type: 'block.qualification';
  readonly _key: string;

  title: string;
  employer: string;
  location: string;
  start: string;
  end: string;
  body: string;
};

export type ServiceItemData = {
  readonly _type: 'block.serviceItem';
  readonly _key: string;

  name: string;
  icon: string;
  body: TypedObject | TypedObject[];
};

export type CustomerItemData = {
  readonly _type: 'object.customerItem';
  readonly _key: string;

  published: boolean;
  name: string;
  image: ImageAssetFragment;
};

export type ProjectItemData = {
  readonly _type: 'object.projectItem';
  readonly _key: string;

  published: boolean;
  name: string;
  image: ImageAssetFragment;
};

export type SectionHeaderData = {
  readonly _type: 'sectionHeader';
  readonly _key: string;

  headline?: string;
  preHeadline?: string;
  subHeadline?: string;
};

export type HeroStageData = {
  headline?: string;
  subHeadline?: string[];
  portrait: ImageAssetFragment;
};

export type CustomersSectionData = {
  readonly _type: 'section.customers';
  readonly _key: string;

  header: SectionHeaderData;
  entries: CustomerItemData[];
};

export type ServicesSectionData = {
  readonly _type: 'section.services';
  readonly _key: string;

  header: SectionHeaderData;
  entries: ServiceItemData[];
};

export type QualificationsSectionData = {
  readonly _type: 'section.qualifications';
  readonly _key: string;

  header: SectionHeaderData;
  entries: QualificationItemData[];
};

export type ProjectTeaserData = {
  title: string;
  excerpt: string;
  category: string;
  poster: ImageAssetFragment;
  urlPath: string;
};

export type ProjectTeaserSectionData = {
  readonly _type: 'section.projects';
  readonly _key: string;

  header: SectionHeaderData;
  projectOne: ProjectTeaserData;
  projectTwo: ProjectTeaserData;
  projectThree: ProjectTeaserData;
  projectFour: ProjectTeaserData;
};

export type ProjectProjectData = {
  readonly _type: 'projects.project';
  readonly _key: string;

  published: boolean;
  title: string;
  subtitle: string;
  excerpt: string;
  category: string;
  links: {
    label: string;
    icon: string;
    url: string;
  }[];
  body: TypedObject | TypedObject[];
  poster: ImageAssetFragment;
  urlPath: string;
};

export type SectionData = QualificationsSectionData | CustomersSectionData;

export type HomeData = {
  title: string;
  heroStage: HeroStageData;
  customers: CustomersSectionData;
  qualifications: QualificationsSectionData;
  services: ServicesSectionData;
  projectTeaser: ProjectTeaserSectionData;
};
