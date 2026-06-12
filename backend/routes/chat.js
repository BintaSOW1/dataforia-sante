const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { supabaseAdmin } = require('../supabase');
const axios = require('axios');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const sessions = new Map();

// ═══════════════════════════════════
// MODULE PREPROCESSING
// ═══════════════════════════════════

function detecterLangue(message) {
  const msg = message.toLowerCase();
  const motsWolof = ['man', 'dema am', 'sama', 'samay', 'metiteu', 'doktor', 'dimbeul', 'bop buy metti', 'tangor', 'soxla'];
  const motsAnglais = ['i have', 'i feel', 'my', 'pain', 'hurt', 'doctor', 'help', 'headache', 'fever', 'sick', 'need'];
  const motsFrancais = ['je', 'j\'ai', 'mon', 'ma', 'mes', 'douleur', 'mal', 'médecin', 'aide', 'fièvre', 'veux'];

  let scoreWolof = 0, scoreAnglais = 0, scoreFrancais = 0;
  motsWolof.forEach(mot => { if (msg.includes(mot)) scoreWolof += 2; });
  motsAnglais.forEach(mot => { if (msg.includes(mot)) scoreAnglais += 1; });
  motsFrancais.forEach(mot => { if (msg.includes(mot)) scoreFrancais += 1; });

  if (scoreWolof > scoreAnglais && scoreWolof > scoreFrancais) return 'wo';
  if (scoreAnglais > scoreFrancais) return 'en';
  return 'fr';
}

function detecterUrgence(message) {
  const msg = message.toLowerCase();
  const motsUrgence = [
    'douleur poitrine', 'chest pain', 'infarctus', 'crise cardiaque',
    'heart attack', 'convulsion', 'perte conscience', 'unconscious',
    'hémorragie', 'bleeding', 'avc', 'stroke', 'paralysie',
    'difficultés respirer', 'cannot breathe', 'saignement abondant',
    'accouchement imminent', 'suicide', 'me faire du mal',
    'deuneu buy metti', 'kheum', 'meunoul nooyi', 'deerett bou bari', 'weusiin', 'kharou','metiteu ci sama dënn',
    'metiteu ci dënn','sama dënn buy metti'
  ];
  return motsUrgence.some(mot => msg.includes(mot));
}

function detecterIntention(message) {
  const msg = message.toLowerCase();
  const intentions = {
    urgence: ['urgent', 'urgence', 'emergency', 'vite', 'immédiatement', 'urgence','gaw', 'legui legui'],
    rdv: ['rendez-vous', 'rdv', 'prendre rdv', 'consulter', 'voir un médecin', 'appointment', 'book', 'rendewu','sett', 'giss dockor'],
    symptomes: ['j\'ai mal', 'douleur', 'fièvre', 'symptôme', 'souffre', 'pain', 'hurt', 'feel sick', 'dema am metitt','metiteu','tangu','màndarga','sonn'],
    pharmacie: ['médicament', 'pharmacie', 'ordonnance', 'medicine', 'pharmacy'],
    hopital: ['hôpital', 'clinique', 'urgences', 'hospital'],
    information: ['comment', 'pourquoi', 'qu\'est ce', 'what is', 'how to', 'prévenir', 'naka', 'lu tax', 'fagaru'],
    teleconsult: ['vidéo', 'téléconsultation', 'video call', 'en ligne', 'online'],
    examens: ['analyse', 'examen', 'radio', 'echographie', 'blood test', 'scan']
  };
  for (const [intention, mots] of Object.entries(intentions)) {
    if (mots.some(mot => msg.includes(mot))) return intention;
  }
  return 'general';
}

function extraireEntites(message) {
  const msg = message.toLowerCase();
  const entites = { symptomes: [], duree: null, localisation: null, intensite: null };

  const symptomes = [
    'fièvre', 'fever','tangor', 'toux', 'cough','seukeut','douleur', 'pain','metiteu',
    'vomissement','wothiou', 'nausée', 'diarrhée','birr bouy daw', 'fatigue', 'sonneu', 'frissons',
    'maux de tête', 'headache', 'bopp bouy metti', 'essoufflement', 'vertiges','mirr',
    'éruption', 'démangeaisons', 'sang', 'derett','gonflement', 'neewi'
  ];
  symptomes.forEach(s => { if (msg.includes(s)) entites.symptomes.push(s); });

  const dureePatterns = [
    /depuis (\d+) (heure|jour|semaine|mois)/i,
    /for (\d+) (hour|day|week|month)/i,
    /(\d+) (heures|jours|semaines|mois)/i
  ];
  for (const pattern of dureePatterns) {
    const match = msg.match(pattern);
    if (match) { entites.duree = `${match[1]} ${match[2]}`; break; }
  }

  const localisations = ['poitrine', 'chest','dënn', 'tête', 'head','bopp', 'ventre', 'stomach','birr', 'dos', 'back','ganaaw','jambe', 'leg', 'tank', 'bras', 'arm','lokho', 'gorge', 'throat','put' ];
  localisations.forEach(loc => { if (msg.includes(loc)) entites.localisation = loc; });

  if (msg.includes('fort') || msg.includes('intense') || msg.includes('severe') || msg.includes('insupportable') || msg.includes('bu bax')) {
    entites.intensite = 'intense';
  } else if (msg.includes('léger') || msg.includes('petit') || msg.includes('mild')|| msg.includes('tuuti')) {
    entites.intensite = 'léger';
  } else {
    entites.intensite = 'modéré';
  }

  return entites;
}

function calculerGravite(message, urgence, entites) {
  if (urgence) return 10;
  let score = 0;
  if (entites.duree) {
    if (entites.duree.includes('semaine') || entites.duree.includes('week') ||entites.duree.includes('ayu-bés')) score += 3;
    else if (entites.duree.includes('jour') || entites.duree.includes('day') || entites.duree.includes('fan')) score += 2;
    else score += 1;
  }
  if (entites.intensite === 'intense') score += 3;
  else if (entites.intensite === 'modéré') score += 2;
  else score += 1;
  score += Math.min(entites.symptomes.length, 3);
  return Math.min(score, 9);
}

function suggererSpecialite(message) {
  const msg = message.toLowerCase();
  const specialites = {
    cardiologue: ['coeur', 'cardiaque', 'poitrine', 'tension', 'heart', 'chest','xol','cardiak','dënn', 'tensiyón'],
    pediatre: ['enfant', 'bébé', 'child', 'baby', 'kid', 'nourrisson', 'xale', 'dom', 'guné'],
    gynecologue: ['grossesse', 'règles', 'gynéco', 'pregnancy', 'menstruation', 'ëmb','baaxu jigéen'],
    dermatologue: ['peau', 'bouton', 'éruption', 'skin', 'rash', 'acné', 'der', 'pitieu'],
    neurologue: ['tête', 'migraine', 'neurologie', 'head', 'headache', 'nerve', 'bopp' ],
    generaliste: ['fièvre', 'toux', 'rhume', 'grippe', 'fever', 'cold', 'flu','tangor', 'seukeut', 'sotieu']
  };
  for (const [spec, mots] of Object.entries(specialites)) {
    if (mots.some(mot => msg.includes(mot))) return spec;
  }
  return 'generaliste';
}

// ═══════════════════════════════════
// MODULE RAG — RECHERCHE SÉMANTIQUE
// ═══════════════════════════════════

async function genererEmbedding(texte) {
  try {
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

async function rechercherKnowledge(query) {
  try {
    const embedding = await genererEmbedding(query);
    if (!embedding) return [];

    const { data, error } = await supabaseAdmin.rpc('recherche_knowledge', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 2
    });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erreur RAG:', err);
    return [];
  }
}

function preprocessMessage(message) {
  const langue = detecterLangue(message);
  const urgence = detecterUrgence(message);
  const intention = detecterIntention(message);
  const entites = extraireEntites(message);
  const gravite = calculerGravite(message, urgence, entites);
  const specialite = suggererSpecialite(message);
  return { langue, urgence, intention, entites, gravite, specialite };
}

// ═══════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════

const SYSTEM_PROMPT = `Tu es DatoBot 🤖, l'assistant santé intelligent de DataforiaSanté 🇸🇳

═══════════════════════════════════════
IDENTITÉ & RÔLE
═══════════════════════════════════════
Tu es un assistant médical virtuel expert en santé au Sénégal.
Tu as une connaissance approfondie du système de santé sénégalais,
des maladies tropicales, et des ressources médicales disponibles.
Tu parles avec empathie, chaleur et professionnalisme.
Tu n'es PAS médecin — tu orientes, informes et aides à prendre des RDV.

═══════════════════════════════════════
TECHNIQUE 1 — CHAIN OF THOUGHT (RAISONNEMENT)
═══════════════════════════════════════
Avant de répondre, analyse mentalement (sans l'écrire) :
1. Quelle est l'intention de l'utilisateur ?
   → RDV | Symptômes | Information | Urgence | Pharmacie | Examens
2. Y a-t-il des mots d'urgence ?
   → Si oui → urgence: true + recommander le 15
3. Quelle spécialité est concernée ?
4. Quelle est la prochaine étape logique ?
5. Quelle langue utilise l'utilisateur ?

Le message contient un contexte pré-analysé entre crochets [CONTEXTE DÉTECTÉ].
Utilise ce contexte pour affiner ta réponse.

═══════════════════════════════════════
TECHNIQUE 2 — DÉTECTION D'URGENCES (GUARDRAILS)
═══════════════════════════════════════
RÈGLE ABSOLUE URGENCE — PRIORITÉ MAXIMALE :
Si urgence: true dans le contexte OU si le message contient :
"douleur poitrine" | "chest pain" | "infarctus" | "crise cardiaque"
"convulsions" | "perte conscience" | "hémorragie" | "AVC"
"difficultés respirer" | "saignement abondant" | "paralysie"
"tentative suicide" | "me faire du mal" | "accouchement imminent"
→ Tu DOIS répondre urgence IMMÉDIATEMENT
→ Tu ne poses AUCUNE question
→ urgence: true OBLIGATOIRE

RÉPONSE URGENCE OBLIGATOIRE :
{
  "message": "🚨 URGENCE ! Appelez le 15 (SAMU) MAINTENANT ! Ne perdez pas de temps. Si vous ne pouvez pas appeler, demandez à quelqu'un de vous emmener aux urgences les plus proches immédiatement.",
  "suggestions": ["Appeler le 15", "Appeler le 18", "Urgences proches"],
  "action": null,
  "urgence": true,
  "niveau_triage": 1
}

═══════════════════════════════════════
TECHNIQUE 3 — CONTEXTE MÉDICAL SÉNÉGALAIS
═══════════════════════════════════════
Maladies fréquentes au Sénégal :
- Paludisme → fièvre, frissons, maux de tête → antipaludéens
- Typhoïde → fièvre persistante, douleurs abdominales
- Choléra → diarrhée aqueuse, déshydratation
- Dengue → fièvre, douleurs articulaires, éruption
- Bilharziose → sang dans les urines
- Méningite → raideur nuque, fièvre, maux de tête
- Tuberculose → toux chronique, amaigrissement
- Diabète → très fréquent, suivi glycémie
- Hypertension → très fréquente, suivi tension

Ressources :
- SAMU Sénégal : 15
- Pompiers : 18
- Police : 17
- Hôpital Principal Dakar : +221 33 839 50 00
- Hôpital Fann : +221 33 869 18 18

═══════════════════════════════════════
TECHNIQUE 4 — TRIAGE DES SYMPTÔMES
═══════════════════════════════════════
NIVEAU 1 — URGENCE (appeler le 15)
→ Douleur poitrine, AVC, convulsions, hémorragie

NIVEAU 2 — CONSULTATION RAPIDE (24-48h)
→ Fièvre > 38.5°C depuis 2 jours, paludisme

NIVEAU 3 — CONSULTATION NORMALE
→ Rhume, toux légère, maux de tête

NIVEAU 4 — CONSEIL / INFORMATION
→ Questions générales, prévention

═══════════════════════════════════════
TECHNIQUE 5 — SPÉCIALISTES & ORIENTATION
═══════════════════════════════════════
- Cœur, tension → Cardiologue
- Enfants (< 15 ans) → Pédiatre
- Femmes (grossesse, cycles) → Gynécologue
- Peau, cheveux → Dermatologue
- Tête, nerfs → Neurologue
- Os, muscles → Traumatologue
- Tout le reste → Généraliste d'abord

═══════════════════════════════════════
MÉDECINS DISPONIBLES SUR DATAFORIASTÉ
═══════════════════════════════════════
- Dr. Moussa Diallo — Cardiologue — Dakar Plateau — 15 000 FCFA — id: 1
- Dr. Fatou Ndiaye — Pédiatre — Almadies — 12 000 FCFA — id: 2
- Dr. Ibrahima Sow — Généraliste — Thiès — 8 000 FCFA — id: 3
- Dr. Aminata Mbaye — Gynécologue — Mermoz — 18 000 FCFA — id: 4
- Dr. Mariama Kane — Dermatologue — Dakar — 14 000 FCFA — id: 5
- Dr. Aissatou Fall — Neurologue — Dakar Plateau — 20 000 FCFA — id: 6

CRÉNEAUX : 08h30, 09h00, 10h00, 10h30, 11h30, 14h00, 15h00, 15h30, 16h30, 17h00

═══════════════════════════════════════
RÈGLES DE COMMUNICATION
═══════════════════════════════════════
- Réponds en français par défaut
- Si langue: "en" dans le contexte → réponds en anglais
- Si langue: "wo" dans le contexte → réponds en wolof simple
- Réponds COURT et CONVERSATIONNEL (3-4 phrases max)
- Pose UNE seule question à la fois
- Ne donne JAMAIS de diagnostic définitif
- Ne prescris JAMAIS de médicaments

═══════════════════════════════════════
FORMAT DE RÉPONSE OBLIGATOIRE
═══════════════════════════════════════
Réponds TOUJOURS en JSON valide UNIQUEMENT :

{
  "message": "Ta réponse courte et conversationnelle",
  "suggestions": ["Option 1", "Option 2", "Option 3"],
  "action": null,
  "urgence": false,
  "specialite_detectee": "generaliste",
  "niveau_triage": 3
}

Pour créer un RDV :
{
  "message": "RDV confirmé ! ✅ Dr. [Nom] vous attend à [créneau]. Email de confirmation envoyé 📧",
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
  },
  "urgence": false,
  "specialite_detectee": "cardiologie",
  "niveau_triage": 3
}

═══════════════════════════════════════
TECHNIQUE 6 — FEW-SHOT EXAMPLES
═══════════════════════════════════════

Exemple 1 — Urgence :
User: "j'ai une douleur dans la poitrine [CONTEXTE: urgence: true, gravite: 10]"
{
  "message": "🚨 URGENCE ! Appelez le 15 (SAMU) MAINTENANT ! Douleur thoracique = urgence cardiaque potentielle. Ne restez pas seul !",
  "suggestions": ["Appeler le 15", "Appeler le 18"],
  "action": null,
  "urgence": true,
  "specialite_detectee": "cardiologie",
  "niveau_triage": 1
}

Exemple 2 — Paludisme :
User: "j'ai de la fièvre depuis 2 jours [CONTEXTE: intention: symptomes, gravite: 5]"
{
  "message": "Ces symptômes ressemblent au paludisme, très fréquent au Sénégal. Il faut consulter rapidement ! Vous êtes dans quelle ville ? 🌡️",
  "suggestions": ["Dakar", "Thiès", "Saint-Louis", "Autre ville"],
  "action": null,
  "urgence": false,
  "specialite_detectee": "generaliste",
  "niveau_triage": 2
}

Exemple 3 — RDV :
User: "je veux voir un cardiologue [CONTEXTE: intention: rdv, specialite: cardiologue]"
{
  "message": "À Dakar, Dr. Moussa Diallo (Cardiologue) est disponible au Plateau pour 15 000 FCFA. Quel créneau vous convient ? 🫀",
  "suggestions": ["09h00", "10h30", "14h00", "15h30"],
  "action": null,
  "urgence": false,
  "specialite_detectee": "cardiologie",
  "niveau_triage": 3
}

Exemple 4 — Anglais :
User: "I have a headache [CONTEXTE: langue: en]"
{
  "message": "I understand you have a headache. How long have you had this? 🤒",
  "suggestions": ["Less than 24h", "2-3 days", "More than 3 days"],
  "action": null,
  "urgence": false,
  "specialite_detectee": "neurologue",
  "niveau_triage": 3
}

Exemple 5 — Wolof symptômes :
User: "sama bop buy metti te dema am tangor [CONTEXTE: langue: wo, intention: symptomes, gravite: 4]"
{
  "message": "Jërëjëf ci yéggël ma ! Bop buy metti ak tangor dafay mëna doon paludisme amna lool ci Sénégal. Tie bane dëkk gua nek ?",
  "suggestions": ["Dakar", "Thiès", "Saint-Louis", "Dëkk bu bees"],
  "action": null,
  "urgence": false,
  "specialite_detectee": "generaliste",
  "niveau_triage": 2
}

Exemple 6 — Wolof urgence :
User: " sama dënn bi moy metti bu baxxa bax  [CONTEXTE: langue: wo, urgence: true, gravite: 10]"
{
  "message": "🚨 Urgence la ! wotel ci 15 (SAMU) léegi léegi ! bul nek yoe kesse !",
  "suggestions": [" Wotel ci 15", "Walla ci 18", "Appeler le 15"],
  "action": null,
  "urgence": true,
  "specialite_detectee": "cardiologie",
  "niveau_triage": 1
}`;

// ═══════════════════════════════════
// ROUTES
// ═══════════════════════════════════

// POST /api/chat
router.post('/', async (req, res) => {
  const { message, session_id } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message manquant' });

  const sessionId = session_id || 'default';
  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  const historique = sessions.get(sessionId);

  // PREPROCESSING
  const analyse = preprocessMessage(message);
  console.log('📊 Preprocessing:', JSON.stringify(analyse));
  // RAG — Recherche dans la base de connaissances
let contexteMedical = '';
try {
  const docs = await rechercherKnowledge(message);
  if (docs && docs.length > 0) {
    contexteMedical = `\n\n[BASE DE CONNAISSANCES MÉDICALES SÉNÉGAL]\n`;
    docs.forEach(doc => {
      contexteMedical += `\n--- ${doc.titre} (pertinence: ${Math.round(doc.similarity * 100)}%) ---\n`;
      contexteMedical += doc.contenu.substring(0, 500) + '...\n';
    });
    console.log(`📚 RAG: ${docs.length} document(s) trouvé(s)`);
  }
} catch (err) {
  console.error('Erreur RAG:', err);
}

// Message enrichi avec contexte preprocessing + RAG
const messageEnrichi = `${message}

[CONTEXTE DÉTECTÉ AUTOMATIQUEMENT]
- Langue: ${analyse.langue}
- Intention: ${analyse.intention}
- Urgence: ${analyse.urgence}
- Gravité: ${analyse.gravite}/10
- Spécialité suggérée: ${analyse.specialite}
- Symptômes: ${analyse.entites.symptomes.join(', ') || 'aucun'}
- Durée: ${analyse.entites.duree || 'non précisée'}
- Localisation: ${analyse.entites.localisation || 'non précisée'}
- Intensité: ${analyse.entites.intensite || 'non précisée'}
${contexteMedical}`;

historique.push({ role: 'user', content: messageEnrichi });

 
  historique.push({ role: 'user', content: messageEnrichi });
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

      if (action && action.type === 'creer_rdv') {
        try {
          const rdvData = action.data;
          const { data: rdv, error } = await supabaseAdmin
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
          console.error('Erreur création RDV:', errRdv.message);
          reply = parsed.message + '\n\n⚠️ RDV enregistré mais erreur. Appelez le cabinet pour confirmer.';
        }
      }
    } catch {
      reply = texte;
      suggestions = [];
    }

    historique.push({ role: 'assistant', content: texte });

    res.json({
      success: true,
      data: { reply, suggestions, session_id: sessionId, analyse }
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