/**
 * Application constants and configuration values.
 */

export const APP_URL: string = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export const APP_NAME: string = 'such.gallery';

export const APP_DESCRIPTION: string = 'An open gallery. Artists can submit their art, anyone can curate.';

export const APP_PRIMARY_CATEGORY: string = 'art-creativity';

export const APP_TAGS: string[] = ['nft', 'curation', 'art', 'gallery'];

export const APP_ICON_URL: string = `${APP_URL}/icon.png`;

export const APP_SPLASH_URL: string = `${APP_URL}/splash.png`;

export const APP_SPLASH_BACKGROUND_COLOR: string = '#f7f7f7';

export const ANALYTICS_ENABLED: boolean = true;

export const RETURN_URL: string | undefined = undefined;

export const BASE_CHAIN_ID = 8453; // Base Mainnet

