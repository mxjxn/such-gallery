// import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiHandler } from 'next'
import { SERVER_SESSION_SETTINGS } from './config'

type SiweMessage = {
  domain: string;
  address: string;
  statement?: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt?: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: Array<string>;
}

/*
declare module 'iron-session' {
  interface IronSessionData {
    nonce: string
    userId: string
    siwe: SiweMessage
  }
}

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, SERVER_SESSION_SETTINGS)
}
*/
