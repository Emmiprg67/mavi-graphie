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
  /** When set, this image belongs to an album and is hidden from the normal gallery/home views. */
  albumId?: string;
};

export type MediaAlbum = {
  id: string;
  title: string;
  coverImageId?: string;
  createdAt?: string;
};
