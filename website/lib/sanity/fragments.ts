export const fileFragment = `
  {
    ...asset-> {
      originalFilename,
      url,
      extension,
      mimeType,
      size
    }
  }
`;

export const imageFragment = `
  {
    crop,
    hotspot,
    ...asset-> {
      originalFilename,
      url,
      extension,
      mimeType,
      size,
      ...metadata {
        hasAlpha,
        isOpaque,
        lqip,
        palette,
        dimensions
      }
    }
  }
`;

export const urlPathFragment = `
  select(
    _type match   "singleton.*"   => "/",
    _type match   "projects.*"    => "/projects/",
    _type match   "blog.*"        => "/blog/",
  ) + select(
    slug.current match  "home"    => "",
    slug.current
  )
`;


export const projectTeaserFragment = `
  {
    title,
    excerpt,
    "urlPath": ${urlPathFragment},
    poster ${imageFragment},
    ...category->{ "category": name },
  }
`;

export const navItemFragment = `
  {
    _type,
    _key,
    label,
    mode,
    variant,
    variant == 'external' => {
      url,
      forceDownload,
      blank
    },
    variant == 'internal' => {
      ...ref-> {
        "url": ${urlPathFragment},
      }
    },
    variant == 'file' => {
      ...file ${fileFragment},
      forceDownload,
      blank
    }
  }
`;

export const navMenuFragment = `
  {
    label,
    entries[] ${navItemFragment}
  }
`;


export const homeDataFragment = `
  {
    ...,
    heroStage {
      ...,
      portrait ${imageFragment},
    },
    services {
      ...
    },
    projectTeaser {
      header,
      projectOne-> ${projectTeaserFragment},
      projectTwo-> ${projectTeaserFragment},
      projectThree-> ${projectTeaserFragment},
      projectFour-> ${projectTeaserFragment}
    },
    customers {
      ...,
      entries[published == true] {
        ...,
        image ${imageFragment},
      }
    }
  }
`
