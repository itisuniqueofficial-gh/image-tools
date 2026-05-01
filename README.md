# Image Tools

Image Tools is a fast, static, browser-based image utility website for `https://image.itisuniqueofficial.com`. It includes tools for compression, resizing, cropping, conversion, PDF creation, enhancement, rotation, watermarking, and metadata cleanup.

## Tech Stack

- Node.js project
- Vite
- TypeScript
- Vanilla HTML/CSS/TS frontend
- Tailwind CSS CDN for utility availability
- Font Awesome CDN for icons
- jsPDF for client-side Image to PDF generation
- Static output for Cloudflare Pages

## Local Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production output is generated in:

```text
dist
```

## Preview

```bash
npm run preview
```

## Cloudflare Pages Deployment

1. Push this project to a GitHub repository.
2. Open the Cloudflare Dashboard.
3. Go to Workers & Pages.
4. Create a Pages project.
5. Connect the GitHub repository.
6. Set the build command to `npm run build`.
7. Set the output directory to `dist`.
8. Deploy the project.
9. Add the custom domain `image.itisuniqueofficial.com` in the Pages custom domains settings.

## SPA Fallback

The project includes `public/_redirects`:

```text
/* /index.html 200
```

This lets Cloudflare Pages serve the Vite SPA for direct visits to routes such as `/image-compressor` or `/tools`.

## Client-Side Image Processing Notes

Most implemented tools use browser APIs such as `FileReader`, `URL.createObjectURL`, `Canvas`, `Blob`, and image decoding. Files are not intentionally uploaded or stored by this static website. Browser support, memory limits, and image format support can vary by device.

Prepared placeholder pages are included for workflows that need additional specialized integrations:

- PDF to Image requires a client-side PDF renderer.
- Background Remover requires an AI or segmentation integration.
