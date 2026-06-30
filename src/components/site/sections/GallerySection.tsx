import { GalleryLightbox } from "./GalleryLightbox";

interface GalleryData {
  title?: string;
  images?: string[];
}

export function GallerySection({ data }: { data: GalleryData }) {
  const images = data.images ?? [];
  if (images.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-14">
      {data.title && (
        <h2 className="text-2xl font-bold text-center mb-8">{data.title}</h2>
      )}
      <GalleryLightbox images={images} title={data.title} />
    </section>
  );
}
