const express = require('express');
const router = express.Router();
const supabase = require('../supabase').supabaseAdmin || require('../supabase');

// GET /api/dossiers
router.get('/', async (req, res) => {
  try {
    const { tel, medecin_id } = req.query;
    let query = supabase.from('dossiers_medicaux').select('*').order('created_at', { ascending: false });
    if (tel) query = query.eq('patient_tel', tel);
    if (medecin_id) query = query.eq('medecin_id', parseInt(medecin_id));
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dossiers/complet/:tel — dossier complet patient
router.get('/complet/:tel', async (req, res) => {
  try {
    const tel = req.params.tel;

    const [consultations, constantes, documents, vaccinations] = await Promise.all([
      supabase.from('dossiers_medicaux').select('*').eq('patient_tel', tel).order('created_at', { ascending: false }),
      supabase.from('constantes_vitales').select('*').eq('patient_tel', tel).order('date_mesure', { ascending: false }),
      supabase.from('documents_medicaux').select('*').eq('patient_tel', tel).order('created_at', { ascending: false }),
      supabase.from('vaccinations').select('*').eq('patient_tel', tel).order('date_vaccination', { ascending: false })
    ]);

    // Récupérer les infos patient depuis la première consultation
    const patient = consultations.data?.[0] || null;

    res.json({
      success: true,
      data: {
        patient: patient ? {
          prenom: patient.patient_prenom,
          nom: patient.patient_nom,
          tel: patient.patient_tel,
          date_naissance: patient.date_naissance,
          groupe_sanguin: patient.groupe_sanguin,
          taille: patient.taille,
          poids: patient.poids,
          allergies: patient.allergies,
          antecedents: patient.antecedents,
          traitements_en_cours: patient.traitements_en_cours,
          medecin_traitant: patient.medecin_traitant
        } : null,
        consultations: consultations.data || [],
        constantes: constantes.data || [],
        documents: documents.data || [],
        vaccinations: vaccinations.data || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/dossiers
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dossiers_medicaux')
      .insert(req.body)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/dossiers/constantes
router.post('/constantes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('constantes_vitales')
      .insert(req.body)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/dossiers/vaccinations
router.post('/vaccinations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vaccinations')
      .insert(req.body)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/dossiers/:id
router.patch('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dossiers_medicaux')
      .update(req.body)
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