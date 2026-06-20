const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');

// POST /api/feedback — sauvegarder un feedback
router.post('/', async (req, res) => {
  const { message_utilisateur, reponse_datobot, reponse_corrigee, feedback, session_id } = req.body;

  if (!message_utilisateur || !reponse_datobot || !feedback) {
    return res.status(400).json({ success: false, message: 'Données manquantes' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('corrections_wolof')
      .insert({
        message_utilisateur,
        reponse_datobot,
        reponse_corrigee: reponse_corrigee || null,
        feedback,
        session_id: session_id || null,
        langue: 'wo'
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`📝 Feedback wolof sauvegardé : ${feedback} — ID: ${data.id}`);
    res.json({ success: true, data });

  } catch (err) {
    console.error('Erreur feedback:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/feedback — récupérer tous les feedbacks
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('corrections_wolof')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/feedback/stats — statistiques
router.get('/stats', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('corrections_wolof')
      .select('feedback');

    if (error) throw error;

    const total = data.length;
    const bons = data.filter(d => d.feedback === 'bon').length;
    const mauvais = data.filter(d => d.feedback === 'mauvais').length;

    res.json({
      success: true,
      stats: {
        total,
        bons,
        mauvais,
        taux_satisfaction: total > 0 ? Math.round((bons / total) * 100) : 0
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
