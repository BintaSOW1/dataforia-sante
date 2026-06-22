const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const axios = require('axios');

// GET /api/commandes/medicaments — liste des médicaments
router.get('/medicaments', async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabaseAdmin
      .from('medicaments')
      .select('*')
      .order('nom');

    if (search) {
      query = query.ilike('nom', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/commandes — créer une commande
router.post('/', async (req, res) => {
  const {
    patient_nom, patient_tel, patient_adresse,
    medicament_id, medicament_nom, quantite,
    prix_total, pharmacie_id, pharmacie_nom,
    mode_livraison, session_id, notes
  } = req.body;

  if (!patient_nom || !patient_tel || !medicament_nom) {
    return res.status(400).json({ success: false, message: 'Données manquantes' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('commandes_medicaments')
      .insert({
        patient_nom,
        patient_tel,
        patient_adresse: patient_adresse || '',
        medicament_id: medicament_id || null,
        medicament_nom,
        quantite: quantite || 1,
        prix_total,
        pharmacie_id: pharmacie_id || null,
        pharmacie_nom: pharmacie_nom || 'Pharmacie la plus proche',
        statut: 'en_attente',
        mode_livraison: mode_livraison || 'livraison',
        session_id: session_id || null,
        notes: notes || ''
      })
      .select()
      .single();

    if (error) throw error;

    // Notifier via webhook Make si disponible
    if (process.env.MAKE_WEBHOOK_URL) {
      await axios.post(process.env.MAKE_WEBHOOK_URL, {
        type: 'commande_medicament',
        commande_id: data.id,
        patient_nom,
        patient_tel,
        medicament_nom,
        quantite,
        prix_total,
        pharmacie_nom,
        mode_livraison
      }).catch(err => console.error('Webhook error:', err.message));
    }

    console.log(`💊 Commande créée : ${medicament_nom} — ID: ${data.id}`);
    res.json({ success: true, data });

  } catch (err) {
    console.error('Erreur commande:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/commandes — liste des commandes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('commandes_medicaments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/commandes/:id — mettre à jour le statut
router.patch('/:id', async (req, res) => {
  const { statut } = req.body;
  try {
    const { data, error } = await supabaseAdmin
      .from('commandes_medicaments')
      .update({ statut })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;