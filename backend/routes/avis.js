const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET /api/avis?medecin_id=1
router.get('/', async (req, res) => {
  try {
    const { medecin_id } = req.query;
    let query = supabase
      .from('avis')
      .select('*')
      .order('created_at', { ascending: false });

    if (medecin_id) query = query.eq('medecin_id', parseInt(medecin_id));

    const { data, error } = await query;
    if (error) throw error;

    // Calculer la note moyenne
    const moyenne = data.length > 0
      ? (data.reduce((sum, a) => sum + a.note, 0) / data.length).toFixed(1)
      : 0;

    res.json({ success: true, data, total: data.length, moyenne: parseFloat(moyenne) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/avis
router.post('/', async (req, res) => {
  try {
    const { medecin_id, patient_prenom, patient_nom, patient_tel, note, commentaire, rdv_id } = req.body;

    if (!medecin_id || !patient_prenom || !patient_nom || !patient_tel || !note) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    if (note < 1 || note > 5) {
      return res.status(400).json({ success: false, message: 'La note doit être entre 1 et 5' });
    }

    // Vérifier si l'avis existe déjà pour ce RDV
    if (rdv_id) {
      const { data: existing } = await supabase
        .from('avis')
        .select('id')
        .eq('rdv_id', rdv_id)
        .single();

      if (existing) {
        return res.status(400).json({ success: false, message: 'Vous avez déjà donné un avis pour ce rendez-vous' });
      }
    }

    const { data, error } = await supabase
      .from('avis')
      .insert({ medecin_id, patient_prenom, patient_nom, patient_tel, note, commentaire, rdv_id, verifie: true })
      .select()
      .single();

    if (error) throw error;

    // Mettre à jour la note du médecin
    const { data: tousAvis } = await supabase
      .from('avis')
      .select('note')
      .eq('medecin_id', medecin_id);

    if (tousAvis && tousAvis.length > 0) {
      const nouvelleMoyenne = (tousAvis.reduce((sum, a) => sum + a.note, 0) / tousAvis.length).toFixed(1);
      await supabase
        .from('medecins')
        .update({ note: parseFloat(nouvelleMoyenne) })
        .eq('id', medecin_id);
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;