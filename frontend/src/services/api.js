import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// ── MÉDECINS ──
export const getMedecins = (filtres = {}) => API.get('/medecins', { params: filtres });
export const getMedecin = (id) => API.get(`/medecins/${id}`);

// ── PHARMACIES ──
export const getPharmacies = (filtres = {}) => API.get('/pharmacies', { params: filtres });
export const getMedicaments = (nom) => API.get('/pharmacies/medicaments', { params: { nom } });

// ── HÔPITAUX ──
export const getHopitaux = (filtres = {}) => API.get('/hopitaux', { params: filtres });
export const getHopitauxDisponibles = () => API.get('/hopitaux/disponibles');

// ── RDV ──
export const creerRdv = (data) => API.post('/rdv', data);
export const getRdv = (filtres = {}) => API.get('/rdv', { params: filtres });
export const annulerRdv = (id) => API.patch(`/rdv/${id}/annuler`);

// ── CHAT ──
export const envoyerMessage = (message, sessionId, location = null) => {
  return api.post('/chat', {
    message,
    session_id: sessionId,
    location: location ? {
      lat: location.lat,
      lng: location.lng
    } : null
  });
};

// ── ORDONNANCES ──
export const envoyerOrdonnance = (data) => API.post('/ordonnances', data);
export const getOrdonnances = (filtres = {}) => API.get('/ordonnances', { params: filtres });

// ── DOSSIERS MÉDICAUX ──
export const getDossiers = (filtres = {}) => API.get('/dossiers', { params: filtres });
export const creerDossier = (data) => API.post('/dossiers', data);
export const mettreAJourDossier = (id, data) => API.patch(`/dossiers/${id}`, data);

// ── DOSSIER MÉDICAL COMPLET ──
export const getDossierComplet = (tel) => API.get(`/dossiers/complet/${tel}`);
export const ajouterConstantes = (data) => API.post('/dossiers/constantes', data);
export const ajouterVaccination = (data) => API.post('/dossiers/vaccinations', data);

// ── AVIS ──
export const getAvis = (medecin_id) => API.get('/avis', { params: { medecin_id } });
export const donnerAvis = (data) => API.post('/avis', data);

// ── EXAMENS ──
export const getExamens = (params = {}) => API.get('/examens', { params });
export const getStructuresExamen = (id) => API.get(`/examens/${id}/structures`);
export const getStructures = (params = {}) => API.get('/examens/structures', { params });
export const analyserOrdonnance = (data) => API.post('/examens/analyser-ordonnance', data);


export default API;