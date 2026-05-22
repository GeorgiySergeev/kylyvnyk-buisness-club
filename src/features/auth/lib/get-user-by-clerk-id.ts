import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";

export async function getUserByClerkId(clerkUserId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });
}
