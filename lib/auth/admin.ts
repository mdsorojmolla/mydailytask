export const ADMIN_EMAIL = "mdsorojmolla20@gmail.com";

export function isAdminUser(user: { email?: string | null } | null | undefined): boolean {
  if (!user?.email) return false;
  return user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
}

export function assertAdmin(user: { email?: string | null } | null | undefined): void {
  if (!isAdminUser(user)) {
    throw new Error("Unauthorized: Only the university routine administrator (mdsorojmolla20@gmail.com) can manage routine versions.");
  }
}
