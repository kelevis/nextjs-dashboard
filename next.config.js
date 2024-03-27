// configureWebpack: {
//     resolve: {
//         alias: {
//             "@": resolve("src"),
//                 "@i": resolve("src/api"),
//                 "@c": resolve("src/components"),
//                 "@a": resolve("src/assets"),
//                 "@s": resolve("src/styles"),
//                 "@u": resolve("src/utils"),
//                 "@v": resolve("src/views")
//         }
//     }
// }

// const path = require('path')
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     reactStrictMode: true,
//     swcMinify: true,
// }
//
// module.exports = {
//     ...nextConfig,
//     webpack: (config,
//               { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
//         config.resolve.alias = {
//             ...config.resolve.alias,
//             '@': path.resolve(__dirname, 'src/app'),
//             '@/components': path.resolve(__dirname, 'components'),
//         }
//         return config
//     },
// }

// const path = require('path');
//
// module.exports = {
//     webpack: (config) => {
//         config.resolve.alias['@'] = path.resolve(__dirname);
//         config.resolve.alias['components'] = path.resolve(__dirname, './components');
//         return config;
//     },
// }

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;



