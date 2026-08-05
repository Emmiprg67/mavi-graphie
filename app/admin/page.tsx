import type { Metadata } from "next";
import { AdminUploadManager } from "@/components/AdminUploadManager";
import { brand } from "@/data/siteContent";

export const metadata: Metadata = {
  title: "Admin Upload",
  description: `Lokaler Uploadbereich für Portfolio- und Startseitenbilder von ${brand.name}.`,
};

export default function AdminPage() {
  return <AdminUploadManager />;
}
