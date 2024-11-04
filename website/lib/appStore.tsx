import React from 'react';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AppConfig } from './types';

export type AppStore = AppConfig & {
  isRouteChanging: boolean;
  showNavigation: boolean;
  animateBackground: boolean;
  headerHeight: number | null;
  previousRoute: string;
  setRouteChanging: (changing: boolean) => void;
  setShowNavigation: (show: boolean) => void;
  setHeaderHeight: (height: number) => void;
  setAppConfig: (settings: Partial<AppConfig>) => void;
  setAnimateBackground: (animate: boolean) => void;
  setPreviousRoute: (route: string) => void;
};
export const useAppStore = create<AppStore, [['zustand/immer', AppStore]]>(
  immer((set) => ({
    isRouteChanging: false,
    showNavigation: false,
    animateBackground: true,
    headerHeight: null,
    features: null,
    contact: null,
    assets: null,
    mainNavigation: null,
    metaNavigation: null,
    footerNavigation: null,
    previousRoute: null,
    setRouteChanging: (changing) => set(() => ({ isRouteChanging: changing })),
    setShowNavigation: (show) => set(() => ({ showNavigation: show })),
    setHeaderHeight: (height) => set(() => ({ headerHeight: height })),
    setAppConfig: (appConfig: Partial<AppConfig>) =>
      set((state) => ({ ...state, ...appConfig })),
    setAnimateBackground: (animate) =>
      set(() => ({ animateBackground: animate })),
    setPreviousRoute: (route) => set(() => ({ previousRoute: route })),
  }))
);
