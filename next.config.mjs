/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@react-pdf/renderer', 'nodemailer', 'exceljs', 'xlsx'],
};

export default nextConfig;
