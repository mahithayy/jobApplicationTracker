import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { initializeUserBoard } from "../init-user-board";
import connectDB from "../db";

const authBaseURL =
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

const vercelOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

const trustedOrigins = [authBaseURL, vercelOrigin].filter(
  (origin): origin is string => Boolean(origin)
);

async function createAuthInstance() {
  const mongooseInstance = await connectDB();
  const client = mongooseInstance.connection.getClient();
  const db = client.db();

  return betterAuth({
    baseURL: authBaseURL,
    database: mongodbAdapter(db, {
      client,
    }),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60,
      },
    },
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            if (user.id) {
              await initializeUserBoard(user.id);
            }
          },
        },
      },
    },
  });
}

type Auth = Awaited<ReturnType<typeof createAuthInstance>>;

let authPromise: Promise<Auth> | null = null;

export function getAuth(): Promise<Auth> {
  authPromise ??= createAuthInstance();
  return authPromise;
}

export const auth = async (request: Request) => {
  const authInstance = await getAuth();
  return authInstance.handler(request);
};

export async function getSession(requestHeaders?: Headers) {
  const authInstance = await getAuth();
  const result = await authInstance.api.getSession({
    headers: requestHeaders || (await nextHeaders()),
  });

  return result;
}

export async function signOut() {
  const authInstance = await getAuth();
  const result = await authInstance.api.signOut({
    headers: await nextHeaders(),
  });

  if (result.success) {
    redirect("/sign-in");
  }
}
