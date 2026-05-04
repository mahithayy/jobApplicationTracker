import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initializeUserBoard } from "../init-user-board";
import connectDB from "../db";

async function createAuthInstance() {
  const mongooseInstance = await connectDB();
  const client = mongooseInstance.connection.getClient();
  const db = client.db();

  return betterAuth({
    database: mongodbAdapter(db, {
      client,
    }),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60,
      },
    },
    trustedOrigins: [
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
    ],
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

export async function getSession() {
  const authInstance = await getAuth();
  const result = await authInstance.api.getSession({
    headers: await headers(),
  });

  return result;
}

export async function signOut() {
  const authInstance = await getAuth();
  const result = await authInstance.api.signOut({
    headers: await headers(),
  });

  if (result.success) {
    redirect("/sign-in");
  }
}
