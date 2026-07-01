export function joinUrl(baseUrl: string, path: string | null | undefined) {
  if (!path) {
    return "";
  }

  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
