import { AppConfigData } from './sanity-queries';

export type AppConfig = Omit<AppConfigData, '_type' | '_id'>;
