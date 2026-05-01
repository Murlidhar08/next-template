"use server";

import { getUserSession } from "@/lib/auth/auth";


export async function getFirstName() {
  const session = await getUserSession();

  return session?.user.name.split(" ")[0];
}
