"use client";

import Image from "next/image";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MediaCategory, MediaImage } from "@/types/media";
import { brand } from "@/data/siteContent";
import { AdminLogoutButton } from "./AdminLogoutButton";

const categories: MediaCategory[] = [
  "Slider",
  "Startseite",
  "Familie",
  "Hochzeit",
  "Paare",
  "Baby",
  "Portrait",
  "Verlobung",
  "Henna",
  "Standesamt",
  "Sonstiges",
];

function imageTitle(image: MediaImage) {
  return image.title || image.alt || image.category;
}

function uploadWithProgress(
  form: FormData,
  onProgress: (progress: number) => void,
) {
  return new Promise<{ images?: MediaImage[]; message?: string }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/images");
    request.withCredentials = true;

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    });

    request.addEventListener("load", () => {
      const data = JSON.parse(request.responseText || "{}") as {
        images?: MediaImage[];
        message?: string;
      };
      if (request.status >= 200 && request.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data.message ?? "Upload fehlgeschlagen."));
      }
    });

    request.addEventListener("error", () => reject(new Error("Upload fehlgeschlagen.")));
    request.send(form);
  });
}

export function AdminUploadManager() {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(
    () => ({
      total: images.length,
      visible: images.filter((image) => image.active !== false).length,
      home: images.filter((image) => image.useOnHome).length,
      photographer: images.filter((image) => image.isPhotographer).length,
    }),
    [images],
  );

  async function loadImages() {
    const response = await fetch("/api/images?includeInactive=true", {
      cache: "no-store",
    });

    if (response.status === 401) {
      window.location.assign("/admin/login");
      return;
    }

    const data = (await response.json()) as { images: MediaImage[] };
    setImages(data.images);
  }

  useEffect(() => {
    loadImages();
  }, []);

  function setFilesFromInput(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFiles(Array.from(event.target.files ?? []));
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );
    setSelectedFiles(files);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const formElement = event.currentTarget;
    if (selectedFiles.length === 0) {
      setMessage("Bitte mindestens ein Bild auswaehlen.");
      return;
    }

    setBusy(true);
    setMessage("");
    setUploadProgress(4);

    const form = new FormData(formElement);
    form.delete("images");
    selectedFiles.forEach((file) => form.append("images", file));
    form.set("useOnHome", form.get("useOnHome") ? "true" : "false");
    form.set("isPhotographer", form.get("isPhotographer") ? "true" : "false");

    try {
      await uploadWithProgress(form, setUploadProgress);
      setUploadProgress(100);
      setMessage("Upload abgeschlossen. Die Bilder sind jetzt verwaltbar.");
      setSelectedFiles([]);
      formElement.reset();
      await loadImages();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload fehlgeschlagen.");
    } finally {
      setBusy(false);
      window.setTimeout(() => setUploadProgress(0), 900);
    }
  }

  async function updateImage(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    form.set("id", id);
    form.set("useOnHome", form.get("useOnHome") ? "true" : "false");
    form.set("isPhotographer", form.get("isPhotographer") ? "true" : "false");
    form.set("active", form.get("active") ? "true" : "false");

    const response = await fetch("/api/images", {
      method: "PATCH",
      body: form,
    });
    const data = (await response.json()) as {
      message?: string;
      images?: MediaImage[];
    };

    if (response.ok) {
      setImages(data.images ?? []);
      setMessage("Bild wurde gespeichert.");
      event.currentTarget.reset();
    } else if (response.status === 401) {
      window.location.assign("/admin/login");
    } else {
      setMessage(data.message ?? "Das Bild konnte nicht gespeichert werden.");
    }

    setBusy(false);
  }

  async function moveImage(id: string, action: "move-up" | "move-down") {
    if (busy) return;

    setBusy(true);
    setMessage("");

    const response = await fetch("/api/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = (await response.json()) as {
      message?: string;
      images?: MediaImage[];
    };

    if (response.ok) {
      setImages(data.images ?? []);
      setMessage("Reihenfolge wurde aktualisiert.");
    } else if (response.status === 401) {
      window.location.assign("/admin/login");
    } else {
      setMessage(data.message ?? "Die Reihenfolge konnte nicht aktualisiert werden.");
    }

    setBusy(false);
  }

  async function deleteImage(id: string) {
    if (!window.confirm("Dieses Bild wirklich loeschen?")) return;

    const response = await fetch("/api/images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      await loadImages();
      setMessage("Bild wurde geloescht.");
    } else if (response.status === 401) {
      window.location.assign("/admin/login");
    } else {
      const data = (await response.json()) as { message?: string };
      setMessage(data.message ?? "Das Bild konnte nicht geloescht werden.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f0ea] text-graphite">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-graphite px-6 py-7 text-white lg:sticky lg:top-0 lg:h-screen">
          <div className="flex items-center justify-between gap-4 lg:block">
            <div>
              <p className="brand-logo text-2xl">{brand.name}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/48">
                Admin Dashboard
              </p>
            </div>
            <div className="lg:mt-9">
              <AdminLogoutButton />
            </div>
          </div>

          <nav className="mt-10 hidden gap-2 lg:grid" aria-label="Admin Navigation">
            <a className="border border-white/15 bg-white/8 px-4 py-3 text-sm" href="#upload">
              Upload
            </a>
            <a className="border border-white/10 px-4 py-3 text-sm text-white/72" href="#bilder">
              Bilder
            </a>
            <a className="border border-white/10 px-4 py-3 text-sm text-white/72" href="/">
              Website ansehen
            </a>
          </nav>

          <div className="mt-12 hidden border-t border-white/12 pt-8 text-sm leading-7 text-white/58 lg:block">
            Alle Aenderungen werden direkt in der bestehenden Upload-Struktur
            gespeichert und bleiben im Frontend austauschbar.
          </div>
        </aside>

        <main className="px-4 py-6 md:px-8 lg:px-10 lg:py-10">
          <header className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="eyebrow">Studio Verwaltung</p>
              <h1 className="serif-heading mt-3 text-[2.4rem] uppercase md:text-[4rem]">
                Bilder verwalten
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                Kuratiere Hero, Slider, Galerie und Editorial-Bereiche aus einem
                zentralen Medienbestand.
              </p>
            </div>

            <a
              href="/"
              className="inline-flex min-h-11 items-center justify-center border border-line bg-white px-5 text-sm font-bold uppercase tracking-normal transition hover:border-clay hover:text-clay"
            >
              Website ansehen
            </a>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Bilder", stats.total],
              ["Sichtbar", stats.visible],
              ["Homepage", stats.home],
              ["Fotograf", stats.photographer],
            ].map(([label, value]) => (
              <div key={label} className="border border-line bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                  {label}
                </p>
                <p className="mt-4 font-serif text-4xl">{value}</p>
              </div>
            ))}
          </section>

          <section id="upload" className="mt-8 border border-line bg-white p-5 md:p-7">
            <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="eyebrow">Upload</p>
                <h2 className="serif-heading mt-3 text-3xl uppercase">
                  Neue Bildserie
                </h2>
                <p className="mt-4 text-sm leading-6 text-muted">
                  Ziehe Bilder direkt hinein oder waehle Dateien aus. Titel,
                  Kategorie und Sichtbarkeit werden fuer alle ausgewaehlten
                  Bilder gesetzt und spaeter pro Card feinjustiert.
                </p>
              </div>

              <div className="grid gap-4">
                <label
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`grid min-h-48 cursor-pointer place-items-center border border-dashed p-6 text-center transition ${
                    dragActive
                      ? "border-clay bg-clay/10"
                      : "border-line bg-ivory hover:border-clay"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    name="images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    className="sr-only"
                    onChange={setFilesFromInput}
                  />
                  <span>
                    <span className="block font-serif text-2xl">
                      Bilder hier ablegen
                    </span>
                    <span className="mt-2 block text-sm text-muted">
                      oder klicken, um Dateien auszuwaehlen
                    </span>
                    {selectedFiles.length > 0 ? (
                      <span className="mt-4 block text-sm font-semibold text-clay">
                        {selectedFiles.length} Datei(en) ausgewaehlt
                      </span>
                    ) : null}
                  </span>
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold">
                    Titel
                    <input name="title" placeholder="Serie oder Bildtitel" />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold">
                    Kategorie
                    <select name="category" defaultValue="Hochzeit">
                      {categories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-semibold">
                  Alt-Text
                  <input name="alt" placeholder="Kurze Beschreibung fuer Barrierefreiheit" />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex min-h-12 items-center gap-3 border border-line bg-ivory px-4 text-sm">
                    <input name="useOnHome" type="checkbox" defaultChecked className="h-4 w-4 accent-clay" />
                    Homepage-Slider
                  </label>
                  <label className="flex min-h-12 items-center gap-3 border border-line bg-ivory px-4 text-sm">
                    <input name="isPhotographer" type="checkbox" className="h-4 w-4 accent-clay" />
                    Fotografenbild
                  </label>
                </div>

                {uploadProgress > 0 ? (
                  <div className="h-2 overflow-hidden bg-line">
                    <div
                      className="h-full bg-clay transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={busy}
                  className="min-h-12 bg-graphite px-7 text-sm font-bold uppercase tracking-normal text-white transition hover:bg-clay disabled:opacity-60"
                >
                  {busy ? "Upload laeuft ..." : "Bilder hochladen"}
                </button>
              </div>
            </form>
          </section>

          {message ? (
            <p className="mt-5 border border-clay/25 bg-white px-5 py-4 text-sm text-graphite">
              {message}
            </p>
          ) : null}

          <section id="bilder" className="mt-10">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">Medienbestand</p>
                <h2 className="serif-heading mt-2 text-3xl uppercase">
                  Vorhandene Bilder
                </h2>
              </div>
              <p className="text-sm text-muted">
                Reihenfolge oben = bevorzugte Darstellung auf Website und Slider.
              </p>
            </div>

            {images.length === 0 ? (
              <p className="border border-line bg-white p-8 text-muted">
                Es wurden noch keine Bilder hochgeladen.
              </p>
            ) : (
              <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                {images.map((image, index) => (
                  <article
                    key={image.id}
                    className="group overflow-hidden border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div className="relative aspect-[16/11] bg-linen">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 1280px) 100vw, 33vw"
                        className={`object-cover transition duration-700 group-hover:scale-[1.025] ${
                          image.active === false ? "opacity-35 grayscale" : ""
                        }`}
                      />
                      <div className="absolute left-4 top-4 bg-white/92 px-3 py-2 text-xs font-bold uppercase tracking-normal">
                        #{String(index + 1).padStart(2, "0")}
                      </div>
                    </div>

                    <form
                      onSubmit={(event) => updateImage(event, image.id)}
                      className="grid gap-4 p-5"
                    >
                      <div className="grid gap-4 md:grid-cols-[1fr_150px]">
                        <label className="grid gap-2 text-sm font-semibold">
                          Titel
                          <input
                            name="title"
                            defaultValue={imageTitle(image)}
                            className="min-h-11"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold">
                          Kategorie
                          <select name="category" defaultValue={image.category} className="min-h-11">
                            {categories.map((category) => (
                              <option key={category}>{category}</option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <label className="grid gap-2 text-sm font-semibold">
                        Alt-Text
                        <input name="alt" defaultValue={image.alt} className="min-h-11" />
                      </label>

                      <label className="grid gap-2 text-sm font-semibold">
                        Bild ersetzen
                        <input
                          name="image"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="min-h-11 bg-ivory p-2"
                        />
                      </label>

                      <div className="grid gap-2 sm:grid-cols-3">
                        <label className="flex min-h-11 items-center gap-2 border border-line bg-ivory px-3 text-sm">
                          <input
                            name="active"
                            type="checkbox"
                            defaultChecked={image.active !== false}
                            className="h-4 w-4 accent-clay"
                          />
                          Sichtbar
                        </label>
                        <label className="flex min-h-11 items-center gap-2 border border-line bg-ivory px-3 text-sm">
                          <input
                            name="useOnHome"
                            type="checkbox"
                            defaultChecked={Boolean(image.useOnHome)}
                            className="h-4 w-4 accent-clay"
                          />
                          Slider
                        </label>
                        <label className="flex min-h-11 items-center gap-2 border border-line bg-ivory px-3 text-sm">
                          <input
                            name="isPhotographer"
                            type="checkbox"
                            defaultChecked={Boolean(image.isPhotographer)}
                            className="h-4 w-4 accent-clay"
                          />
                          Fotograf
                        </label>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          disabled={index === 0 || busy}
                          onClick={() => moveImage(image.id, "move-up")}
                          className="min-h-11 border border-line px-4 text-sm font-semibold transition hover:border-clay hover:text-clay disabled:opacity-40"
                        >
                          Reihenfolge hoch
                        </button>
                        <button
                          type="button"
                          disabled={index === images.length - 1 || busy}
                          onClick={() => moveImage(image.id, "move-down")}
                          className="min-h-11 border border-line px-4 text-sm font-semibold transition hover:border-clay hover:text-clay disabled:opacity-40"
                        >
                          Reihenfolge runter
                        </button>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-[1fr_0.8fr]">
                        <button
                          type="submit"
                          disabled={busy}
                          className="min-h-11 bg-graphite px-4 text-sm font-bold uppercase tracking-normal text-white transition hover:bg-clay disabled:opacity-60"
                        >
                          Speichern
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteImage(image.id)}
                          className="min-h-11 border border-line px-4 text-sm font-semibold transition hover:border-clay hover:text-clay"
                        >
                          Loeschen
                        </button>
                      </div>
                    </form>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
