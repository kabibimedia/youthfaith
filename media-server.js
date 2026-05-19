const NodeMediaServer = require('node-media-server');

const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 60,
        ping_timeout: 30,
    },
    http: {
        port: 8001,
        allow_origin: '*',
        mediaroot: './media',
    },
};

const nms = new NodeMediaServer(config);
nms.run();

console.log('📡 Media server running');
console.log(`   RTMP: rtmp://localhost:1935/live/{stream_key}`);
console.log(`   HLS:  http://localhost:8001/live/{stream_key}.m3u8`);
