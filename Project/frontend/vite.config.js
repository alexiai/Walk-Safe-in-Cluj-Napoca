export default {
  build: {
    sourcemap: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  //server: {
      //proxy: {
      //'/api': {
        //target: 'http://localhost:5000',
        //changeOrigin: true
      //},
      //'/socket.io': {
        //target: 'http://localhost:5000',
        //ws: true,
      //},
    //}
  //}
}
