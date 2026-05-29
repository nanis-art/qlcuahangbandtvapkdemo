import {
    defineConfig
} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
})


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import fs from 'fs'
// import path from 'path'

// export default defineConfig({
//   plugins: [
//     react(),
//     {
//       name: 'local-json-backend',
//       configureServer(server) {
//         server.middlewares.use((req, res, next) => {
//           if (req.method === 'PUT' && req.url.startsWith('/api/')) {
//             const endpoint = req.url.split('?')[0];
//             const fileName = endpoint.replace('/api/', '') + '.json';
//             const filePath = path.resolve(__dirname, 'public', fileName);
//             let chunks = [];
//             req.on('data', chunk => { chunks.push(chunk); });
//             req.on('end', () => {
//               try {
//                 const buffer = Buffer.concat(chunks);
//                 const bodyStr = buffer.toString('utf-8');
//                 const json = JSON.parse(bodyStr);
//                 fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8');
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.end(JSON.stringify({ success: true }));
//               } catch (err) {
//                 res.statusCode = 500;
//                 res.end(JSON.stringify({ error: err.message }));
//               }
//             });
//           } else {
//             next();
//           }
//         });
//       }
//     }
//   ]
// })