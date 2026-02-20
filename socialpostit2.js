const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

// Configurazione EJS e Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Per servire le immagini

const JSON_FILE = path.join(__dirname, 'posts.json');

// Configurazione Multer per salvataggio immagini
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ROTTA: Form di caricamento
app.get('/post', (req, res) => {
    res.render('form'); // Renderizza views/form.ejs
});

// ROTTA: Salvataggio Post (Immagine + Testo)
app.post('/post', upload.single('image'), (req, res) => {
    const posts = fs.existsSync(JSON_FILE) ? JSON.parse(fs.readFileSync(JSON_FILE)) : [];
    
    const newPost = {
        id: Date.now(),
        title: req.body.title,
        description: req.body.description,
        imageName: req.file.filename,
        imagePath: '/uploads/' + req.file.filename,
        extraInfo: req.body.extraInfo || ""
    };

    posts.push(newPost);
    fs.writeFileSync(JSON_FILE, JSON.stringify(posts, null, 2));
    res.redirect('/postGallery');
});

// ROTTA: Gallery
app.get('/postGallery', (req, res) => {
    const posts = fs.existsSync(JSON_FILE) ? JSON.parse(fs.readFileSync(JSON_FILE)) : [];
    res.render('gallery', { posts: posts });
});

// ROTTA: Dettaglio Post Singolo
app.get('/post/:id', (req, res) => {
    const posts = JSON.parse(fs.readFileSync(JSON_FILE));
    const post = posts.find(p => p.id == req.params.id);
    res.render('postDetail', { post: post });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000/postGallery'));