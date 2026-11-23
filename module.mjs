// @ts-check
import { module } from "@prisma/composer";
import { envSecret } from "@prisma/composer-prisma-cloud";
import { postgres, dataContract } from "@prisma/composer-prisma-cloud/orm";
import contractJson from "./src/prisma/contract.json" with { type: "json" };
import service from "./service.mjs";

const contract = /** @type {import("@prisma/composer-prisma-cloud/orm").PostgresContract<import("./src/prisma/contract").Contract>} */ (
  dataContract(contractJson)
);

export default module("prisma-postgres-bole-plank", ({ provision }) => {
  const database = provision(
    postgres({ name: "database", contract, config: "./prisma.config.ts" }),
  );
  provision(service, {
    id: "pravaahupsc",
    deps: { db: database },
    input: {
      AUTH_SECRET: envSecret("AUTH_SECRET"), // Signs session tokens.
      GOOGLE_CLIENT_ID: envSecret("GOOGLE_CLIENT_ID"), // Google OAuth client ID for sign-in.
      GOOGLE_CLIENT_SECRET: envSecret("GOOGLE_CLIENT_SECRET"), // Google OAuth client secret for sign-in.
      GEMINI_API_KEY: envSecret("GEMINI_API_KEY"), // Evaluates mains answers with Gemini.
      CRON_SECRET: envSecret("CRON_SECRET"), // Guards the daily-ingest cron endpoint.
      UPI_GATEWAY_API_KEY: envSecret("UPI_GATEWAY_API_KEY"), // Authenticates payment requests to the UPI gateway.
      UPI_GATEWAY_API_SECRET: envSecret("UPI_GATEWAY_API_SECRET"), // Signs payment requests to the UPI gateway.
      UPI_GATEWAY_WEBHOOK_SECRET: envSecret("UPI_GATEWAY_WEBHOOK_SECRET"), // Verifies UPI gateway webhook signatures.
    },
  });
});
