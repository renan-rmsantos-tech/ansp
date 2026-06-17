import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer (e suas dependências de fonte/pdfkit) deve rodar no
  // Node das Server Actions sem ser empacotado pelo bundler.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
