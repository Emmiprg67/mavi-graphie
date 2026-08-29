export type MediaCategory =
  | "Slider"
  | "Startseite"
  | "Familie"
  | "Hochzeit"
  | "Paare"
  | "Baby"
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
  active?: boolean;
  createdAt?: string;
};
