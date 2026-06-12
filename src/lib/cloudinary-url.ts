const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME ?? "dwnin5hyu";

interface CloudinaryUrlOptions {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: string;
  crop?: string;
}

export function cloudinaryUrl(
  publicIdOrUrl: string,
  opts: CloudinaryUrlOptions = {}
): string {
  // If already a full URL, return as-is (or just use it)
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  const transforms: string[] = [
    `f_${opts.format ?? "auto"}`,
    `q_${opts.quality ?? "auto"}`,
  ];
  if (opts.width) transforms.push(`w_${opts.width}`);
  if (opts.height) transforms.push(`h_${opts.height}`);
  if (opts.crop) transforms.push(`c_${opts.crop}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicIdOrUrl}`;
}
