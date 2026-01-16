//  @type {import('next').NextConfig} 
const nextConfig = {
  reactStrictMode : false,
  env: {
    backend_url:
      process.env.NODE_ENV === "production"
        ? ""
        : "",
    socket_url: "",
  },
    images: {
      domains: ['appstick.s3.ap-southeast-1.amazonaws.com','i.ibb.co.com'],
    },
  };
  
  module.exports = nextConfig
