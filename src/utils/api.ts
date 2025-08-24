import CryptoJS from "crypto-js";

export function makeSign(
  payload: Record<string, string | number | object>
): string {
  const SALT = process.env.API_SALT ?? "Unknown";

  const queryString = (Object.keys(payload) as string[])
    .sort()
    .map((key) => {
      const value =
        typeof payload[key] === "object"
          ? JSON.stringify(payload[key])
          : payload[key];
      return `${key}=${value}`;
    })
    .join("&");

  return CryptoJS.MD5(queryString + SALT).toString(CryptoJS.enc.Hex);
}
