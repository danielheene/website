import blockImage from './objects/object.image';
import blockImages from './objects/object.images';
import blockCode from './objects/object.code';
import blockContent from './objects/block.content';
import blogPost from './documents/blog.post';
import blogCategory from './documents/blog.category';
import blogTag from './documents/blog.tag';
import projectsProject from './documents/projects.project';
import projectsCategory from './documents/projects.category';
import projectsTag from './documents/projects.tag';
import settingsMain from './documents/settings.main';
import settingsMeta from './documents/settings.meta';
import settingsNavigation from './documents/settings.navigation';
import singletonHome from './documents/singleton.home';
import singletonImprint from './documents/singleton.imprint';
import singletonPrivacy from './documents/singleton.privacy';
import objectsAssets from './objects/settings.assets';

import objectNavigationItem from './objects/object.navigationItem';
import navigation from './objects/object.navigation';
import sectionHeader from './objects/object.sectionHeader';
import serviceItem from './objects/object.serviceItem';
import sectionCustomers from './objects/section.customers';
import objectCustomerItem from './objects/object.customerItem';
import sectionQualifications from './objects/section.qualifications';
import sectionServices from './objects/section.services';
import settingsMetaTag from './objects/settings.metaTag';
import settingsFeatures from './objects/settings.features';
import settingsContact from './objects/settings.contact';

export const schemaTypes = [
  /* blocks */
  blockCode,
  blockImage,
  blockImages,
  blockContent,

  /* objects */
  objectsAssets,
  objectNavigationItem,
  navigation,
  sectionHeader,
  serviceItem,
  objectCustomerItem,
  sectionCustomers,
  sectionServices,
  sectionQualifications,

  /* settings objects */
  settingsContact,
  settingsMetaTag,
  settingsFeatures,

  /* blog feature */
  blogPost,
  blogCategory,
  blogTag,
  projectsProject,
  projectsCategory,
  projectsTag,

  /* settings */
  settingsMain,
  settingsMeta,
  settingsNavigation,

  /* singleton */
  singletonHome,
  singletonImprint,
  singletonPrivacy,
];
