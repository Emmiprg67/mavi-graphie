export type MediaCategory =
  | "Slider"
  | "Startseite"
  | "Hochzeit"
  | "Destination Wedding"
  | "Portrait"
  | "Verlobung"
  | "Henna"
  | "Standesamt"
  | "Sonstiges";

export type MediaImage = {
  id: string;
  src: string;
  publicId?: string;
  title?: string;
  alt: string;
  category: MediaCategory;
  width?: number;
  height?: number;
  useOnHome?: boolean;
  isPhotographer?: boolean;
  isCategoryCover?: boolean;
  active?: boolean;
  createdAt?: string;
  /** When true, this image belongs to the single Album area and is hidden from the normal gallery/home/photographer views. */
  inAlbum?: boolean;
};
