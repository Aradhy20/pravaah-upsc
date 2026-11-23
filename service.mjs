// @ts-check
import { type } from "arktype";
import { secretString } from "@prisma/composer/arktype";
import nextjs from "@prisma/composer/nextjs";
import { compute } from "@prisma/composer-prisma-cloud";
import { postgres, dataContract } from "@prisma/composer-prisma-cloud/orm";
import contractJson from "./src/prisma/contract.json" with { type: "json" };

/** The emitted Prisma ORM 8 contract, with its precise TypeScript types. */
const contract = /** @type {import("@prisma/composer-prisma-cloud/orm").PostgresContract<import("./src/prisma/contract").Contract>} */ (
  dataContract(contractJson)
);

export default compute({
  name: "pravaahupsc",
  deps: { db: postgres(contract) },
  input: type({
    AUTH_SECRET: secretString(),
    GOOGLE_CLIENT_ID: secretString(),
    GOOGLE_CLIENT_SECRET: secretString(),
    GEMINI_API_KEY: secretString(),
    CRON_SECRET: secretString(),
    UPI_GATEWAY_API_KEY: secretString(),
    UPI_GATEWAY_API_SECRET: secretString(),
    UPI_GATEWAY_WEBHOOK_SECRET: secretString(),
  }),
  build: nextjs({ module: import.meta.url, appDir: "." }),
});
