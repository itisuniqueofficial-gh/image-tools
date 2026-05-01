export type ToolDefinition = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  icon: string;
  implemented: boolean;
  tags: string[];
};

export const tools: ToolDefinition[] = [
  { slug: 'image-compressor', name: 'Image Compressor', shortName: 'Compress Image', description: 'Reduce JPG, PNG, and WebP file sizes with adjustable browser-side quality settings.', category: 'Compress & Optimize', icon: 'fa-compress', implemented: true, tags: ['compress', 'optimize', 'jpg', 'png', 'webp'] },
  { slug: 'image-resizer', name: 'Image Resizer', shortName: 'Resize Image', description: 'Change image width and height with an optional aspect-ratio lock.', category: 'Resize & Edit', icon: 'fa-expand', implemented: true, tags: ['resize', 'dimensions', 'scale'] },
  { slug: 'image-cropper', name: 'Image Cropper', shortName: 'Crop Image', description: 'Crop images using precise X, Y, width, and height values.', category: 'Resize & Edit', icon: 'fa-crop-simple', implemented: true, tags: ['crop', 'edit'] },
  { slug: 'image-converter', name: 'Image Converter', shortName: 'Convert Image', description: 'Convert browser-supported image files to JPG, PNG, or WebP.', category: 'Convert Formats', icon: 'fa-wand-magic-sparkles', implemented: true, tags: ['convert', 'format'] },
  { slug: 'image-to-pdf', name: 'Image to PDF', shortName: 'Image to PDF', description: 'Combine one or more images into a downloadable PDF in your browser.', category: 'PDF Tools', icon: 'fa-file-image', implemented: true, tags: ['pdf', 'images'] },
  { slug: 'pdf-to-image', name: 'PDF to Image', shortName: 'PDF to Image', description: 'Render PDF pages to downloadable PNG images directly in your browser.', category: 'PDF Tools', icon: 'fa-layer-group', implemented: true, tags: ['pdf', 'render', 'png'] },
  { slug: 'jpg-to-png', name: 'JPG to PNG', shortName: 'JPG to PNG', description: 'Convert JPG photos into PNG images using browser canvas export.', category: 'Convert Formats', icon: 'fa-image', implemented: true, tags: ['jpg', 'png', 'convert'] },
  { slug: 'png-to-jpg', name: 'PNG to JPG', shortName: 'PNG to JPG', description: 'Create JPG files from PNG images with quality control.', category: 'Convert Formats', icon: 'fa-image', implemented: true, tags: ['png', 'jpg', 'convert'] },
  { slug: 'webp-converter', name: 'WebP Converter', shortName: 'WebP Converter', description: 'Convert images to efficient WebP files where your browser supports it.', category: 'Convert Formats', icon: 'fa-image', implemented: true, tags: ['webp', 'convert'] },
  { slug: 'background-remover', name: 'Background Remover', shortName: 'Background Remover', description: 'Polished workspace prepared for future AI background removal.', category: 'Creative Tools', icon: 'fa-wand-magic-sparkles', implemented: false, tags: ['background', 'ai'] },
  { slug: 'image-enhancer', name: 'Image Enhancer', shortName: 'Image Enhancer', description: 'Adjust brightness, contrast, saturation, and sharpness in the browser.', category: 'Creative Tools', icon: 'fa-gears', implemented: true, tags: ['enhance', 'brightness', 'contrast'] },
  { slug: 'image-rotator', name: 'Image Rotator', shortName: 'Rotate Image', description: 'Rotate images by 90, 180, or 270 degrees and download the result.', category: 'Resize & Edit', icon: 'fa-rotate-right', implemented: true, tags: ['rotate', 'edit'] },
  { slug: 'image-watermark', name: 'Image Watermark Tool', shortName: 'Watermark Image', description: 'Add a text watermark to an image before downloading.', category: 'Creative Tools', icon: 'fa-regular fa-image', implemented: true, tags: ['watermark', 'text'] },
  { slug: 'metadata-remover', name: 'Metadata Remover', shortName: 'Remove Metadata', description: 'Re-encode images through canvas to strip most embedded metadata.', category: 'Privacy Tools', icon: 'fa-shield-halved', implemented: true, tags: ['metadata', 'privacy', 'exif'] },
];

export const categories = [...new Set(tools.map((tool) => tool.category))];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function relatedTools(slug: string, limit = 4): ToolDefinition[] {
  const current = getTool(slug);
  return tools.filter((tool) => tool.slug !== slug && (!current || tool.category === current.category || tool.implemented)).slice(0, limit);
}
