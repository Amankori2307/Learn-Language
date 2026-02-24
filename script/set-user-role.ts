import { eq } from "drizzle-orm";
import { db } from "../server/nest/src/infrastructure/db";
import { users } from "../server/nest/src/infrastructure/schema";

type Role = "learner" | "reviewer" | "admin";

async function main() {
  const identifier = process.argv[2];
  const role = process.argv[3] as Role | undefined;

  if (!identifier || !role || !["learner", "reviewer", "admin"].includes(role)) {
    console.error("Usage: node --import tsx script/set-user-role.ts <email-or-user-id> <learner|reviewer|admin>");
    process.exit(1);
  }

  const [updatedByEmail] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.email, identifier))
    .returning();

  if (updatedByEmail) {
    console.log(`Updated role to '${role}' for user ${updatedByEmail.id} (${updatedByEmail.email})`);
    return;
  }

  const [updatedById] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, identifier))
    .returning();

  if (updatedById) {
    console.log(`Updated role to '${role}' for user ${updatedById.id} (${updatedById.email})`);
    return;
  }

  console.error(`No user found for '${identifier}'`);
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
