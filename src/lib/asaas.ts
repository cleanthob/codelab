import axios from "axios";

const apiKey = process.env.ASAAS_API_KEY;
const apiUrl = process.env.ASAAS_API_URL;

if (!apiKey || !apiUrl) {
  throw new Error("ASAAS_API_KEY e ASAAS_API_URL devem ser definidos");
}

const parsedApiUrl = new URL(apiUrl);

if (
  parsedApiUrl.hostname === "sandbox.asaas.com" &&
  parsedApiUrl.pathname.replace(/\/+$/, "") === "/api/v3"
) {
  parsedApiUrl.hostname = "api-sandbox.asaas.com";
  parsedApiUrl.pathname = "/v3";
}

export const asaasApi = axios.create({
  baseURL: parsedApiUrl.toString().replace(/\/+$/, ""),
  headers: {
    access_token: apiKey,
  },
});
