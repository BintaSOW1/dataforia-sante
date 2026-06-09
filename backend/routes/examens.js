const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const Anthropic = require('@anthropic-ai/sdk');

// GET /api/examens — liste tous les examens
router.get('/', async (req, res) => {
  try {
    const { categorie, q } = req.query;
    let query = supabase
      .from('examens')
      .select('*')
      .order('nom');

    if (categorie) query = query.eq('categorie', categorie);
    if (q) query = query.ilike('nom', `%${q}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/examens/structures — toutes les structures
router.get('/structures', async (req, res) => {
  try {
    const { type, ville } = req.query;
    let query = supabase
      .from('structures_medicales')
      .select('*')
      .order('nom');

    if (type) query = query.eq('type', type);
    if (ville) query = query.ilike('ville', `%${ville}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/examens/analyser-ordonnance
router.post('/analyser-ordonnance', async (req, res) => {
  try {
    const { image, type } = req.body;
    if (!image) return res.status(400).json({ success: false, message: 'Image manquante' });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: type || 'image/jpeg',
              data: image
            }
          },
          {
            type: 'text',
            text: `Tu es un assistant medical. Analyse cette ordonnance medicale et liste UNIQUEMENT les examens biologiques, radiologiques ou medicaux prescrits.
            
            Reponds UNIQUEMENT en JSON avec ce format exact:
            {
              "examens": ["nom examen 1", "nom examen 2"],
              "medecin": "nom du medecin si visible",
              "patient": "nom du patient si visible",
              "date": "date si visible"
            }
            
            Si ce n'est pas une ordonnance medicale, reponds: {"examens": [], "erreur": "Document non reconnu comme ordonnance medicale"}
            
            Traduis les abreviations medicales en noms complets. Ex: NFS = Numeration Formule Sanguine, ECG = Electrocardiogramme, TDM = Scanner`
          }
        ]
      }]
    });

    const texte = response.content[0].text;
    let resultat;
    try {
      const clean = texte.replace(/```json|```/g, '').trim();
      resultat = JSON.parse(clean);
    } catch {
      resultat = { examens: [], erreur: 'Impossible de lire l\'ordonnance' };
    }

    // Rechercher les examens dans la base de données
    const examensDetails = [];
    for (const nomExamen of (resultat.examens || [])) {
      const { data } = await supabase
        .from('examens')
        .select('*')
        .ilike('nom', `%${nomExamen.split(' ')[0]}%`)
        .limit(1);
      if (data && data.length > 0) {
        examensDetails.push(data[0]);
      }
    }

    res.json({
      success: true,
      data: {
        ...resultat,
        examens_details: examensDetails
      }
    });
  } catch (err) {
    console.error('Erreur analyse ordonnance:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/examens/:id/structures — structures qui font cet examen
router.get('/:id/structures', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('examens_structures')
      .select(`
        prix,
        disponible,
        structures_medicales (
          id, nom, type, ville, adresse, tel, horaires, livraison_resultats
        )
      `)
      .eq('examen_id', req.params.id)
      .eq('disponible', true);

    if (error) throw error;
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;