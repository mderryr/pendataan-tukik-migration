import MillionLint from "@million/lint";
import million from "million/compiler";

// const withPWA = require('next-pwa')({
//     dest: 'public',
//     register: true,
//     skipWaiting: true,
//     disable: process.env.NODE_ENV === 'development'
//   })

/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false
      }
    }
    return config
  },
  reactStrictMode: true,
  experimental: {
    // serverActions:,
    // serverExternalPackages: ['@react-pdf/renderer'],
    // runtime: 'experimental-edge',
    // esmExternals: "loose",
    reactCompiler: {
      compilationMode: "annotation",
    },
  },
  images:{
    domains:['images.unsplash.com','upload.wikimedia.org/wikipedia/commons'],
    remotePatterns:[
      new URL('https://images.unsplash.com/*'),
      new URL('https://upload.wikimedia.org/wikipedia/commons/*'),
      // new URL('https://www.shutterstock.com/*')
    ],

  },
  env: {
    SECREATKEY: process.env.SECREATKEY,
    // Config Firebase client (bukan rahasia, memang dibutuhkan di browser)
    APIKEY: process.env.APIKEY,
    AUTHDOMAIN: process.env.AUTHDOMAIN,
    PROJECTID: process.env.PROJECTID,
    STORAGEBUCKER: process.env.STORAGEBUCKER,
    MESSAGINGSENDERID: process.env.MESSAGINGSENDERID,
    APPID: process.env.APPID,
    // Opsional: tanpa key, pemilih lokasi memakai GPS / tempel koordinat
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  // runtime: 'edge',
  reactStrictMode: true,
};

export default MillionLint.next({
  auto: { rsc: true },
})(million.next(nextConfig));
