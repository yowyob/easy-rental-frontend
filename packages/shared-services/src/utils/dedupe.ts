/** Removes duplicate list entries by `id` (keeps first occurrence). */
export function dedupeById<T extends { id?: unknown }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = item?.id != null ? String(item.id) : '';
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
