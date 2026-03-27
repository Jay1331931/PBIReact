import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    port: 3001,
  }
})


// import fs from'fs';
 
// export default defineConfig({
// plugins: [react()],
// server: {
// port: 3001,
// https: {
// key: fs.readFileSync('C:/Users/absadmin/Desktop/abscert/df9663638260e2eb.pem'), 
// cert: fs.readFileSync('C:/Users/absadmin/Desktop/abscert/df9663638260e2eb.crt'), 
//     },
// open: true,
// host: true},
// });



// C:\Users\absadmin\Desktop\abscert

// abs.crt

// df9663638260e2eb.pem