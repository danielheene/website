import { groq } from 'next-sanity';
import {
  fileFragment,
  homeDataFragment,
  imageFragment,
  navMenuFragment,
  urlPathFragment,
} from './fragments';
import { getClient } from '@lib/sanity/client';

export const fetchHomeData = async (isPreview = false) => {
  const client = getClient(isPreview);

  const query = isPreview
    ? groq`*[_id in ["singleton.home", "drafts.singleton.home"]] | order(_updatedAt desc)[0] ${homeDataFragment}`
    : groq`*[_id == "singleton.home" && !(_id in path("drafts.**"))][0] ${homeDataFragment}`;

  return await client.fetch(query);
};

export const projectUrlsQuery = groq`
 *[_type == "projects.project" && !(_id in path("drafts.**"))] {
    "urlPath": ${urlPathFragment},
 }
`;

export const projectQuery = groq`
  *[_type == "projects.project" && !(_id in path("drafts.**")) && slug.current == $slug][0] {
    _id,
    _type,
    _rev,
    title,
    "slug": slug.current,
    "urlPath": ${urlPathFragment},
    body[] {
      _key,
      _type,
      _type == "object.image" => ${imageFragment},
      _type != "object.image" => { ... },
    },
    excerpt,
    links,
    tags->{ ... },
    "category": category->name,
    metaDescription,
    metaKeywords,
    metaTags,
    poster ${imageFragment},
  }
`;

export const imprintQuery = groq`
  *[_type == "singleton.imprint" && !(_id in path("drafts.**"))][0] {
    _id,
    _type,
    _rev,
    title,
    "urlPath": ${urlPathFragment},
    body[] {
      _key,
      _type,
      _type == "object.image" => ${imageFragment},
      _type != "object.image" => { ... },
    },
    metaDescription,
    metaKeywords,
    metaTags
  }
`;

export const mainNavigationQuery = groq`
  *[_type == "settings.navigation" && defined(main) && !(_id in path("drafts.**"))][0]{...main} ${navMenuFragment}
`;

export const metaNavigationQuery = groq`
  *[_type == "settings.navigation" && defined(meta) && !(_id in path("drafts.**"))][0]{...meta} ${navMenuFragment}
`;

export const footerNavigationQuery = groq`
  *[_type == "settings.navigation" && defined(footer) && !(_id in path("drafts.**"))][0]{...footer} ${navMenuFragment}
`;

export const fetchAppConfig = async (isPreview = false) => {
  const client = getClient(isPreview);

  return await client.fetch(groq`
  {
    ...*[_type == "settings.main" && !(_id match "drafts.*")][0] {
      contact,
      features,
      assets {
        publicKey ${fileFragment},
        resume ${fileFragment},
      }
    },
    ...*[_type == "settings.meta" && !(_id match "drafts.*")][0] {
      titleTemplate,
      metaDescription,
      metaKeywords,
      metaTags
    },
    "mainNavigation": ${mainNavigationQuery},
    "metaNavigation": ${metaNavigationQuery},
    "footerNavigation": ${footerNavigationQuery},
  }
`);
};

export const pathFromIdQuery = groq`*[_id == $id][0]{"urlPath": ${urlPathFragment}}.urlPath`;
