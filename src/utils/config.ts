"use server";

import {
  mainnet,
  sepolia,
  polygon,
  optimism,
  arbitrum,
} from "@wagmi/core/chains";
import styles from "../styles";

export const SITE_NAME = "Such Gallery";
export const SITE_DESCRIPTION = "a community-curated gallery for NFTs";
export const SITE_URL = "https://suchgallery.vercel.app";

export const SOCIAL_TWITTER = "mxjxn";
export const SOCIAL_FARCASTER = "mxjxn";
export const SOCIAL_GITHUB = "mxjxn/suchgallery";

export const ETH_CHAINS = [mainnet, sepolia, polygon, optimism, arbitrum];

export const SERVER_SESSION_SETTINGS = {
  cookieName: SITE_NAME,
  password:
    process.env.SESSION_PASSWORD ??
    "whithout-the-iron-session-password-this-will-not-work",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
