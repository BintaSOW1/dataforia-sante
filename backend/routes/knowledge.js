const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { supabaseAdmin } = require('../supabase');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ═══════════════════════════════════
// GÉNÉRER LES EMBEDDINGS
// ═══════════════════════════════════

async function genererEmbedding(texte) {
  try {
    // Utiliser l'API Voyage d'Anthropic pour les embeddings
    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'voyage-2',
        input: texte
      })
    });
    const data = await response.json();
    return data.data[0].embedding;
  } catch (err) {
    console.error('Erreur embedding:', err);
    return null;
  }
}

// POST /api/knowledge/embeddings — générer tous les embeddings
router.post('/embeddings', async (req, res) => {
  try {
    // Récupérer tous les documents sans embedding
    const { data: docs, error } = await supabaseAdmin
      .from('knowledge_base')
      .select('id, titre, contenu')
      .is('embedding', null);

    if (error) throw error;
    if (!docs || docs.length === 0) {
      return res.json({ success: true, message: 'Tous les embeddings sont déjà générés' });
    }

    console.log(`📚 Génération embeddings pour ${docs.length} documents...`);

    let success = 0;
    for (const doc of docs) {
      const texte = `${doc.titre}\n\n${doc.contenu}`;
      const embedding = await genererEmbedding(texte);

      if (embedding) {
        await supabaseAdmin
          .from('knowledge_base')
          .update({ embedding })
          .eq('id', doc.id);
        success++;
        console.log(`✅ Embedding généré : ${doc.titre}`);
      }

      // Pause pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    res.json({
      success: true,
      message: `${success}/${docs.length} embeddings générés`
    });

  } catch (err) {
    console.error('Erreur génération embeddings:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/knowledge — lister tous les documents
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('knowledge_base')
      .select('id, titre, categorie, mots_cles, langue, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/knowledge/recherche — recherche sémantique
router.post('/recherche', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ success: false, message: 'Query manquante' });

  try {
    const embedding = await genererEmbedding(query);
    if (!embedding) throw new Error('Embedding non généré');

    const { data, error } = await supabaseAdmin.rpc('recherche_knowledge', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 3
    });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;