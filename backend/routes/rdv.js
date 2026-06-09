const express = require('express');
const router = express.Router();
const supabase = require('../supabase').supabaseAdmin || require('../supabase');
const axios = require('axios');

// Générer un lien Jitsi unique
function genererLienVideo(rdvId) {
  const roomName = `DataforiaSante-${rdvId}-${Date.now()}`;
  return `https://meet.jit.si/${roomName}`;
}

// POST /api/rdv
router.post('/', async (req, res) => {
  try {
    const {
      medecin_id, medecin_nom, specialite,
      patient_prenom, patient_nom, patient_tel,
      patient_email, creneau, motif
    } = req.body;

    if (!patient_prenom || !patient_nom || !patient_tel || !creneau || !medecin_id) {
      return res.status(400).json({
        success: false,
        message: 'Champs obligatoires manquants'
      });
    }

    const isTeleconsult = motif && motif.includes('[TÉLÉCONSULTATION]');
    const rdvId = `RDV-${Date.now()}`;
    const lienVideo = isTeleconsult ? genererLienVideo(rdvId) : null;

    const rdv = {
      id: rdvId,
      medecin_id,
      medecin_nom,
      specialite,
      patient_prenom,
      patient_nom,
      patient_tel,
      patient_email: patient_email || null,
      creneau,
      motif: motif || null,
      statut: 'confirme'
    };

    const { data, error } = await supabase
      .from('rendez_vous')
      .insert(rdv)
      .select()
      .single();

    if (error) throw error;

    
    console.log(`✅ RDV créé : ${data.id} — ${patient_prenom} ${patient_nom} ${isTeleconsult ? '(Téléconsultation)' : ''}`);

    // Notifier Make pour automatisation
    try {
      await axios.post(process.env.MAKE_WEBHOOK_URL, {
        rdv_id: data.id,
        patient_prenom,
        patient_nom,
        patient_tel,
        patient_email: patient_email || null,
        medecin_nom,
        medecin_id,
        specialite,
        creneau,
        motif: motif || null,
        type: isTeleconsult ? 'teleconsultation' : 'cabinet',
        lien_video: lienVideo || null,
        date_creation: data.created_at
      });
      console.log('📨 Make notifié avec succès');
    } catch (errWebhook) {
      console.error('⚠️ Erreur notification Make:', errWebhook.message);
    }

    res.status(201).json({
      success: true,
      message: 'Rendez-vous confirmé',
      data: {
        ...data,
        lien_video: lienVideo,
        patient: {
          prenom: data.patient_prenom,
          nom: data.patient_nom,
          tel: data.patient_tel,
          email: data.patient_email
        }
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/rdv
router.get('/', async (req, res) => {
  try {
    const { tel, medecin_id } = req.query;
    let query = supabase
      .from('rendez_vous')
      .select('*')
      .order('created_at', { ascending: false });
    if (tel) query = query.eq('patient_tel', tel);
    if (medecin_id) query = query.eq('medecin_id', medecin_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/rdv/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rendez_vous')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/rdv/:id/annuler
router.patch('/:id/annuler', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rendez_vous')
      .update({ statut: 'annule' })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, message: 'RDV annulé', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;