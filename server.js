const express = require('express');
const path = require('path');
const app = express();

// FBX dosyaları için MIME type tanımı
express.static.mime.define({'application/octet-stream': ['fbx']});

// Hata ayıklama için logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Statik dosyaları sunmak için
app.use(express.static(__dirname, {
    setHeaders: (res, path) => {
        if (path.endsWith('.fbx')) {
            res.set('Content-Type', 'application/octet-stream');
            res.set('Access-Control-Allow-Origin', '*');
        }
    }
}));

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Models sayfası
app.get('/models', (req, res) => {
    res.sendFile(path.join(__dirname, 'models.html'));
});

// Hata yakalama
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Sunucuyu başlat
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 