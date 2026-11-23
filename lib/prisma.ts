import service from "../service.mjs";

type LoadedDeps = ReturnType<typeof service.load>;

/** The Prisma ORM 8 client, carried by the service's `db` dependency. */
export type PrismaClient = LoadedDeps["db"]["client"];

let cached: PrismaClient | undefined;

// `service.load()` is read at query time, never at module scope: under Next.js
// every route module is imported at build time without the runtime environment.
// It caches its result, so the first query hydrates the dependency once.
function getClient(): PrismaClient {
  if (!cached) {
    cached = service.load().db.client;
  }
  return cached;
}

/**
 * The Prisma ORM 8 client, lazy so importing this module stays safe at build
 * time. Queries read `prisma.orm.public.<Model>`.
 */
export const prisma: any = new Proxy(
  {} as PrismaClient,
  {
    get(_target, prop) {
      const client = getClient() as unknown as Record<string | symbol, unknown>;
      const value = Reflect.get(client, prop);
      return typeof value === "function" ? value.bind(client) : value;
    },
    has(_target, prop) {
      return prop in (getClient() as unknown as object);
    },
  },
) as any;
