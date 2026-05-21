import albumData from "../data/album.json";
import { url } from "../config";

export interface AlbumItem {
  id: number;
  title: string;
  desc: string;
  fileName: string;
  path: string;
  date: string;
}

export function getAlbumList(): AlbumItem[] {
  return [...(albumData as AlbumItem[])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function resolveAlbumSrc(path: string): string {
  return url(path.replace(/^\//, ""));
}
