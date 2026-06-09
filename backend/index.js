const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importer le système de rappels automatiques
require('./rappels');

const app = express();






app.use(cors());
app.use(express.json());

// ── ROUTES ──
app.get('/', (req, res) => {
  res.json({ 
    message: 'DataforiaSanté API',
    version: '1.0.0',
    status: 'ok'
  });
});

// Routes à venir
app.use('/api/medecins', require('./routes/medecins'));
app.use('/api/pharmacies', require('./routes/pharmacies'));
app.use('/api/hopitaux', require('./routes/hopitaux'));
app.use('/api/rdv', require('./routes/rdv'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/ordonnances', require('./routes/ordonnances'));
app.use('/api/dossiers', require('./routes/dossiers'));
app.use('/api/avis', require('./routes/avis'));
app.use('/api/examens', require('./routes/examens'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 DataforiaSanté API démarrée sur http://localhost:${PORT}`);
});
