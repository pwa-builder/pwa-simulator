import { Transaction } from '@codemirror/state';

/**
 * Reference: https://www.w3.org/TR/image-resource/#dom-imageresource
 */
 export type ImageResource = {
  src: string;
  sizes?: string;
  type?: string;
  label?: string;
}

export type Shortcut = {
  name: string;
  url: string;
  short_name?: string;
  description?: string;
  icons?: ImageResource[];
}

export type Display = 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';

/**
 * Web app manifest
 */
export interface Manifest {
  name?: string;
  short_name?: string;
  icons?: ImageResource[];
  display?: Display;
  orientation?: 'any' | 'natural' | 'landscape' | 'landscape-primary' | 'landscape-secondary' | 'portrait' | 'portrait-primary' | 'portrait-secondary';
  dir?: 'auto' | 'ltr' | 'rtl';
  lang?: string;
  theme_color?: string;
  related_applications?: {
    platform?: string;
    url?: string;
    id?: string;
  }[];
  prefer_related_applications?: boolean;
  background_color?: string;
  shortcuts?: Shortcut[];
  categories?: string[];
  description?: string;
  screenshots?: ImageResource[];
  iarc_rating_id?: string;
}

/**
 * Type of the parameter for indicating the helper messages.
 */
 export type Explanations = {
  initial: string;
  appWindow: string;
  startMenu: string;
  store: string;
  jumpList: string;
}

/**
 * Typings for codemirror
 */
export enum CodeEditorEvents {
  sync = 'code-editor-sync',
  update = 'code-editor-update',
}

export interface CodeEditorSyncEvent {
  text: string;
}

export interface CodeEditorUpdateEvent {
  transaction: Transaction;
}
