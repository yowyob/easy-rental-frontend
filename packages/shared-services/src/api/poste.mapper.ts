/** Maps poste payloads and API responses for snake_case backend. */
export function normalizePostePayload(data: {
  name: string;
  description: string;
  permissionIds?: string[];
  permission_ids?: string[];
}) {
  return {
    name: data.name,
    description: data.description,
    permission_ids: data.permission_ids ?? data.permissionIds ?? [],
  };
}

export function normalizePoste(raw: Record<string, unknown> | null | undefined) {
  if (!raw) return null;
  const permissions = Array.isArray(raw.permissions) ? raw.permissions : [];
  const orgId = raw.organizationId ?? raw.organization_id;
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    organizationId: orgId,
    isSystem: orgId == null,
    permissions: permissions.map((perm) => {
      const p = perm as Record<string, unknown>;
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        tag: p.tag,
        module: p.module,
      };
    }),
  };
}
