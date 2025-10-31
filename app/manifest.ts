import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dosya Atama Sistemi",
    short_name: "Dosya Atama",
    description: "RAM Yük Dengelemeli Atama",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0ea5e9",
    icons: [
      // Not: PNG ikonlarınız yoksa favicon ile idare edebilir; üretildikten sonra 192/512 PNG ekleyin
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      // Önerilen (varsa):
      // { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      // { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    lang: "tr",
    dir: "ltr",
  };
}
