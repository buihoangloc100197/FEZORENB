import { PayOS } from "@payos/node";

const clientId = process.env.PAYOS_CLIENT_ID || "placeholder-client-id";
const apiKey = process.env.PAYOS_API_KEY || "placeholder-api-key";
const checksumKey = process.env.PAYOS_CHECKSUM_KEY || "placeholder-checksum-key";

export const isPayOSConfigured = Boolean(
  process.env.PAYOS_CLIENT_ID &&
  process.env.PAYOS_API_KEY &&
  process.env.PAYOS_CHECKSUM_KEY &&
  !process.env.PAYOS_CLIENT_ID.includes("placeholder")
);

export const payOS = new PayOS({
  clientId,
  apiKey,
  checksumKey,
});
