const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// POST /api/ordonnances — envoyer une ordonnance
router.post('/', async (req, res) => {
  try {
    const {
      patient_prenom, patient_nom, patient_tel,
      pharmacie_id, pharmacie_nom,
      medicaments, mode_reception
    } = req.body;

    if (!patient_prenom || !patient_nom || !patient_tel || !pharmacie_id) {
      return res.status(400).json({
        success: false,
        message: 'Champs obligatoires manquants'
      });
    }

    const ordonnance = {
      id: `ORD-${Date.now()}`,
      patient_prenom,
      patient_nom,
      patient_tel,
      pharmacie_id,
      pharmacie_nom,
      medicaments: medicaments || null,
      mode_reception: mode_reception || 'livraison',
      statut: 'en_attente'
    };

    const { data, error } = await supabase
      .from('ordonnances')
      .insert(ordonnance)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Ordonnance : ${data.id} — ${patient_prenom} ${patient_nom}`);

    res.status(201).json({
      success: true,
      message: 'Ordonnance envoyée avec succès',
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/ordonnances — liste des ordonnances
router.get('/', async (req, res) => {
  try {
    const { tel, pharmacie_id } = req.query;
    let query = supabase
      .from('ordonnances')
      .select('*')
      .order('created_at', { ascending: false });

    if (tel) query = query.eq('patient_tel', tel);
    if (pharmacie_id) query = query.eq('pharmacie_id', pharmacie_id);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data, total: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/ordonnances/:id — mettre à jour le statut
router.patch('/:id', async (req, res) => {
  try {
    const { statut } = req.body;
    const { data, error } = await supabase
      .from('ordonnances')
      .update({ statut })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;