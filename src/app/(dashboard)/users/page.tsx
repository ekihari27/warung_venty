import { getUsers } from "@/actions/users";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersClient users={JSON.parse(JSON.stringify(users))} />;
}
