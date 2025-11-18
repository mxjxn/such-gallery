import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { APP_URL } from './constants';

let neynarClient: NeynarAPIClient | null = null;

export function getNeynarClient() {
  if (!neynarClient) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY not configured');
    }
    const config = new Configuration({ apiKey });
    neynarClient = new NeynarAPIClient(config);
  }
  return neynarClient;
}

export async function getNeynarUser(fid: number) {
  try {
    const client = getNeynarClient();
    const usersResponse = await client.fetchBulkUsers({ fids: [fid] });
    return usersResponse.users[0] || null;
  } catch (error) {
    console.error('Error getting Neynar user:', error);
    return null;
  }
}

type SendMiniAppNotificationResult =
  | { state: "error"; error: unknown }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" };

export async function sendNeynarMiniAppNotification({
  fid,
  title,
  body,
}: {
  fid: number;
  title: string;
  body: string;
}): Promise<SendMiniAppNotificationResult> {
  try {
    const client = getNeynarClient();
    const targetFids = [fid];
    const notification = {
      title,
      body,
      target_url: APP_URL,
    };

    const result = await client.publishFrameNotifications({ 
      targetFids, 
      notification 
    });

    if (result.notification_deliveries.length > 0) {
      return { state: "success" };
    } else if (result.notification_deliveries.length === 0) {
      return { state: "no_token" };
    } else {
      return { state: "error", error: result || "Unknown error" };
    }
  } catch (error) {
    return { state: "error", error };
  }
}

/**
 * Get user's verified Ethereum address from FID
 */
export async function getUserEthAddress(fid: number): Promise<string | null> {
  try {
    const user = await getNeynarUser(fid);
    if (!user) {
      return null;
    }

    // Get primary verified address
    const verifiedAddress = user.verified_addresses?.primary?.eth_address;
    if (verifiedAddress) {
      return verifiedAddress.toLowerCase();
    }

    // Fallback to custody address if no verified address
    if (user.custody_address) {
      return user.custody_address.toLowerCase();
    }

    return null;
  } catch (error) {
    console.error('Error getting user ETH address:', error);
    return null;
  }
}

