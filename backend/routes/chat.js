const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const supabase = require('../supabase');
const axios = require('axios');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const sessions = new Map();

const SYSTEM_PROMPT = `Tu es DatoBot, l'assistant santé intelligent de DataforiaSanté 🇸🇳

Tu aides les patients au Sénégal à :
- Trouver un médecin ou spécialiste
- Prendre rendez-vous en ligne
- Vérifier la disponibilité des hôpitaux
- Commander des médicaments en pharmacie
- Envoyer une ordonnance
- Réserver une téléconsultation vidéo
- Comprendre leurs symptômes (sans diagnostic médical)
- Trouver où faire des analyses médicales

RÈGLES IMPORTANTES :
- Tu réponds TOUJOURS en français sauf si le patient écrit en anglais
- Si le patient écrit en anglais, réponds en anglais
- Tu n'es PAS médecin — tu orientes vers les professionnels de santé
- Pour les urgences, tu dis toujours d'appeler le 15 (SAMU Sénégal)
- Tu connais les prix en FCFA
- Réponds de façon COURTE et CONVERSATIONNELLE — pas de tableaux, pas de listes longues
- Maximum 3-4 phrases par réponse
- Pose UNE seule question à la fois
- Sois chaleureux et naturel comme dans une vraie conversation

MÉDECINS DISPONIBLES SUR DATAFORIASTÉ :
- Dr. Moussa Diallo — Cardiologue — Dakar Plateau — 15 000 FCFA — id: 1
- Dr. Fatou Ndiaye — Pédiatre — Almadies — 12 000 FCFA — id: 2
- Dr. Ibrahima Sow — Généraliste — Thiès — 8 000 FCFA — id: 3
- Dr. Aminata Mbaye — Gynécologue — Mermoz — 18 000 FCFA — id: 4
- Dr. Mariama Kane — Dermatologue — Dakar — 14 000 FCFA — id: 5
- Dr. Aissatou Fall — Neurologue — Dakar Plateau — 20 000 FCFA — id: 6

CRÉNEAUX DISPONIBLES : 08h30, 09h00, 10h00, 10h30, 11h30, 14h00, 15h00, 15h30, 16h30, 17h00

FORMAT DE RÉPONSE OBLIGATOIRE — réponds TOUJOURS en JSON valide :
{
  "message": "Ta réponse courte et conversationnelle ici",
  "suggestions": ["Option 1", "Option 2", "Option 3"],
  "action": null
}

Quand tu as collecté TOUTES les informations pour créer un RDV (prénom, nom, téléphone, médecin, créneau), retourne :
{
  "message": "Votre RDV est confirmé ! ✅ Dr. [Nom] vous attend [créneau]. Un email de confirmation va vous être envoyé.",
  "suggestions": ["Voir mes RDV", "Retour à l'accueil"],
  "action": {
    "type": "creer_rdv",
    "data": {
      "medecin_id": 1,
      "medecin_nom": "Dr. Moussa Diallo",
      "specialite": "Cardiologue",
      "patient_prenom": "Aminata",
      "patient_nom": "Diallo",
      "patient_tel": "77 123 45 67",
      "patient_email": "",
      "creneau": "09h00",
      "motif": "Consultation cardiologie"
    }
  }
}

EXEMPLES DE CONVERSATION :
User: "Je veux voir un cardiologue"
{
  "message": "Je vais vous trouver un cardiologue ! 🫀 Vous êtes dans quelle ville ?",
  "suggestions": ["Dakar", "Thiès", "Saint-Louis", "Autre ville"],
  "action": null
}

User: "Dakar"
{
  "message": "À Dakar, Dr. Moussa Diallo est disponible au Plateau (15 000 FCFA). Vous préférez consulter comment ?",
  "suggestions": ["En cabinet", "Téléconsultation vidéo", "Voir d'autres médecins"],
  "action": null
}

User: "En cabinet"
{
  "message": "Parfait ! Pour réserver votre RDV, quel créneau vous convient ?",
  "suggestions": ["09h00", "10h30", "14h00", "15h30"],
  "action": null
}

User: "09h00"
{
  "message": "Super ! J'ai besoin de vos informations. Quel est votre prénom ?",
  "suggestions": [],
  "action": null
}

User: "Aminata"
{
  "message": "Aminata, quel est votre nom de famille ?",
  "suggestions": [],
  "action": null
}

User: "Diallo"
{
  "message": "Et votre numéro de téléphone ?",
  "suggestions": [],
  "action": null
}

User: "77 123 45 67"
{
  "message": "RDV confirmé ! ✅ Dr. Moussa Diallo vous attend demain à 09h00. Un email de confirmation va vous être envoyé 📧",
  "suggestions": ["Retour à l'accueil", "Prendre un autre RDV"],
  "action": {
    "type": "creer_rdv",
    "data": {
      "medecin_id": 1,
      "medecin_nom": "Dr. Moussa Diallo",
      "specialite": "Cardiologue",
      "patient_prenom": "Aminata",
      "patient_nom": "Diallo",
      "patient_tel": "77 123 45 67",
      "patient_email": "",
      "creneau": "09h00",
      "motif": "Consultation cardiologie"
    }
  }
}

User: "I need a doctor"
{
  "message": "I'll help you find a doctor! 🩺 What city are you in?",
  "suggestions": ["Dakar", "Thiès", "Saint-Louis", "Other city"],
  "action": null
}`;

// POST /api/chat
router.post('/', async (req, res) => {
  const { message, session_id } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message manquant' });

  const sessionId = session_id || 'default';
  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  const historique = sessions.get(sessionId);

  historique.push({ role: 'user', content: message });
  if (historique.length > 20) historique.splice(0, 2);

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: historique
    });

    const texte = response.content[0].text;
    let reply = texte;
    let suggestions = [];
    let action = null;

    try {
      const clean = texte.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      reply = parsed.message || texte;
      suggestions = parsed.suggestions || [];
      action = parsed.action || null;

      // Exécuter l'action créer_rdv
      if (action && action.type === 'creer_rdv') {
        try {
          const rdvData = action.data;

          const { data: rdv, error } = await supabase
            .from('rendez_vous')
            .insert({
              medecin_id: rdvData.medecin_id,
              medecin_nom: rdvData.medecin_nom,
              specialite: rdvData.specialite,
              patient_prenom: rdvData.patient_prenom,
              patient_nom: rdvData.patient_nom,
              patient_tel: rdvData.patient_tel,
              patient_email: rdvData.patient_email || '',
              creneau: rdvData.creneau,
              motif: rdvData.motif || 'Consultation',
              statut: 'confirme',
              lien_video: null
            })
            .select()
            .single();

          if (error) throw error;

          // Notifier Make pour email de confirmation
          if (process.env.MAKE_WEBHOOK_URL && rdv) {
            await axios.post(process.env.MAKE_WEBHOOK_URL, {
              rdv_id: rdv.id,
              patient_prenom: rdvData.patient_prenom,
              patient_nom: rdvData.patient_nom,
              patient_tel: rdvData.patient_tel,
              patient_email: rdvData.patient_email || '',
              medecin_nom: rdvData.medecin_nom,
              medecin_id: rdvData.medecin_id,
              specialite: rdvData.specialite,
              creneau: rdvData.creneau,
              motif: rdvData.motif,
              type: 'consultation',
              lien_video: null,
              date_creation: rdv.created_at
            });
            console.log('📨 Make notifié — RDV DatoBot créé:', rdv.id);
          }

          reply = parsed.message + `\n\n🔖 Référence : ${rdv.id}`;

        } catch (errRdv) {
          console.error('Erreur création RDV depuis DatoBot:', errRdv.message);
          reply = parsed.message + '\n\n⚠️ Le RDV a été enregistré mais une erreur est survenue. Appelez le cabinet pour confirmer.';
        }
      }

    } catch {
      reply = texte;
      suggestions = [];
    }

    historique.push({ role: 'assistant', content: texte });

    res.json({
      success: true,
      data: { reply, suggestions, session_id: sessionId }
    });

  } catch (err) {
    console.error('Erreur Claude:', err.message);
    res.json({
      success: true,
      data: {
        reply: 'Je rencontre une difficulté technique. Réessayez dans quelques instants ou appelez le 15 pour les urgences. 🏥',
        suggestions: ['Réessayer', 'Appeler le 15'],
        session_id: sessionId
      }
    });
  }
});

// DELETE /api/chat/:session_id
router.delete('/:session_id', (req, res) => {
  sessions.delete(req.params.session_id);
  res.json({ success: true, message: 'Session réinitialisée' });
});

module.exports = router;