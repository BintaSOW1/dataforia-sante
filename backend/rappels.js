const cron = require('node-cron');
const axios = require('axios');
const supabase = require('./supabase');

// Fonction pour envoyer rappel via Make
async function envoyerRappel(rdv, type) {
  try {
    await axios.post(process.env.MAKE_WEBHOOK_URL, {
      rdv_id: rdv.id,
      patient_prenom: rdv.patient_prenom,
      patient_nom: rdv.patient_nom,
      patient_tel: rdv.patient_tel,
      patient_email: rdv.patient_email,
      medecin_nom: rdv.medecin_nom,
      specialite: rdv.specialite,
      creneau: rdv.creneau,
      type_notification: type, // 'rappel_24h' ou 'rappel_1h'
      lien_video: rdv.lien_video || null
    });
    console.log(`📨 Rappel ${type} envoyé pour ${rdv.id}`);
  } catch (err) {
    console.error(`⚠️ Erreur rappel ${type}:`, err.message);
  }
}

// Vérifier les RDV toutes les heures
cron.schedule('0 * * * *', async () => {
  console.log('🕐 Vérification des rappels RDV...');

  try {
    const maintenant = new Date();
    const dans24h = new Date(maintenant.getTime() + 24 * 60 * 60 * 1000);
    const dans1h = new Date(maintenant.getTime() + 60 * 60 * 1000);

    // Récupérer tous les RDV confirmés
    const { data: rdvs, error } = await supabase
      .from('rendez_vous')
      .select('*')
      .eq('statut', 'confirme');

    if (error) throw error;

    rdvs.forEach(function(rdv) {
      // Parser le créneau (ex: "09h00") avec la date du jour
      var creneau = rdv.creneau;
      var heures = parseInt(creneau.split('h')[0]);
      var minutes = parseInt(creneau.split('h')[1] || '0');

      var dateRdv = new Date(rdv.created_at);
      dateRdv.setHours(heures, minutes, 0, 0);

      var diffMs = dateRdv.getTime() - maintenant.getTime();
      var diffH = diffMs / (1000 * 60 * 60);

      // Rappel 24h avant
      if (diffH >= 23 && diffH <= 25) {
        envoyerRappel(rdv, 'rappel_24h');
      }

      // Rappel 1h avant
      if (diffH >= 0.5 && diffH <= 1.5) {
        envoyerRappel(rdv, 'rappel_1h');
      }
    });

  } catch (err) {
    console.error('❌ Erreur vérification rappels:', err.message);
  }
});

console.log('⏰ Système de rappels automatiques actif');

module.exports = {};