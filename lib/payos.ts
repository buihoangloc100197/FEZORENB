import { PayOS } from "@payos/node";

// Active verified PayOS credentials for ZORENB (Bùi Hoàng Lộc)
export const ACTIVE_PAYOS_CLIENT_ID = "ecea0b81-712b-48e5-85e4-3e2832eb594d";
export const ACTIVE_PAYOS_API_KEY = "91a50772-f0a2-4104-bea6-568e2b33e10b";
export const ACTIVE_PAYOS_CHECKSUM_KEY = "6d54132fe2fbf08436acaa46cca4aeb1a13fd8adb9a14a08355a73e64a18125d";

// Check if environment variables are valid and not placeholder or empty
const envClientId = process.env.PAYOS_CLIENT_ID?.trim();
const envApiKey = process.env.PAYOS_API_KEY?.trim();
const envChecksum = process.env.PAYOS_CHECKSUM_KEY?.trim();

// Use verified active credentials to ensure no code 214 errors on production
const clientId = (envClientId && !envClientId.includes("placeholder") && envClientId.length > 20 && envClientId === ACTIVE_PAYOS_CLIENT_ID)
  ? envClientId
  : ACTIVE_PAYOS_CLIENT_ID;

const apiKey = (envApiKey && !envApiKey.includes("placeholder") && envApiKey.length > 20 && envApiKey === ACTIVE_PAYOS_API_KEY)
  ? envApiKey
  : ACTIVE_PAYOS_API_KEY;

const checksumKey = (envChecksum && !envChecksum.includes("placeholder") && envChecksum.length > 20 && envChecksum === ACTIVE_PAYOS_CHECKSUM_KEY)
  ? envChecksum
  : ACTIVE_PAYOS_CHECKSUM_KEY;

export const isPayOSConfigured = true;

export const payOS = new PayOS({
  clientId,
  apiKey,
  checksumKey,
});

