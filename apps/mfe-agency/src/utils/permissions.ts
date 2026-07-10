/* eslint-disable @typescript-eslint/no-explicit-any */

export const hasPermission = (userData: any, staffPermissions: any, tag: string): boolean => {
  if (!userData) return false;

  if (['ORGANIZATION_OWNER', 'ADMIN', 'ORGANIZATION'].includes(userData.role)) {
    return true;
  }

  if (!Array.isArray(staffPermissions)) return false;

  return staffPermissions.some((p: any) => {
    const permissionTag = typeof p === 'string' ? p : p.tag;
    return permissionTag === tag;
  });
};