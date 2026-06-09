import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getMedecins, getPharmacies, getHopitaux } from '../services/api';

// Fix icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icônes personnalisées
function createIcon(emoji, color) {
  return L.divIcon({
    html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:1rem;transform:rotate(-45deg)"><span style="transform:rotate(45deg)">${emoji}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
    className: ''
  });
}

const ICONS = {
  medecin: createIcon('🩺', '#006B3F'),
  pharmacie: createIcon('💊', '#0369A1'),
  hopital: createIcon('🏥', '#DC2626'),
  user: createIcon('📍', '#F59E0B')
};

// Coordonnées des villes sénégalaises
const COORDS = {
  'Dakar Plateau': [14.6937, -17.4441],
  'Almadies': [14.7469, -17.5059],
  'Mermoz': [14.7167, -17.4833],
  'Thiès': [14.7886, -16.9260],
  'Saint-Louis': [16.0209, -16.4886],
  'Ziguinchor': [12.5600, -16.2719],
  'Kaolack': [14.1392, -16.0726],
  'Dakar': [14.6928, -17.4467],
  'Grand-Yoff': [14.7333, -17.4500],
  'Ouakam': [14.7167, -17.5000],
  'Liberté VI': [14.7200, -17.4600],
  'Parcelles Assainies': [14.7667, -17.4167]
};

function getCoords(ville) {
  for (const [key, coords] of Object.entries(COORDS)) {
    if (ville && ville.toLowerCase().includes(key.toLowerCase())) return coords;
  }
  return [14.6928 + (Math.random() - 0.5) * 0.1, -17.4467 + (Math.random() - 0.5) * 0.1];
}

export default function Carte() {
  const [medecins, setMedecins] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [hopitaux, setHopitaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [position, setPosition] = useState(null);
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    charger();
    // Géolocalisation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => setPosition([14.6928, -17.4467]) // Dakar par défaut
      );
    }
  }, []);

  async function charger() {
    try {
      setLoading(true);
      const [resMed, resPha, resHop] = await Promise.all([
        getMedecins(),
        getPharmacies(),
        getHopitaux()
      ]);
      setMedecins(resMed.data.data || []);
      setPharmacies(resPha.data.data || []);
      setHopitaux(resHop.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtres = [
    { key: 'tous', label: '🗺️ Tout', color: 'var(--green)' },
    { key: 'medecins', label: '🩺 Médecins', color: '#006B3F' },
    { key: 'pharmacies', label: '💊 Pharmacies', color: '#0369A1' },
    { key: 'hopitaux', label: '🏥 Hôpitaux', color: '#DC2626' }
  ];

  const medecinsFiltres = medecins.filter(m =>
    !recherche || m.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    m.spec.toLowerCase().includes(recherche.toLowerCase()) ||
    m.ville.toLowerCase().includes(recherche.toLowerCase())
  );

  const total = (filtre === 'tous' || filtre === 'medecins' ? medecinsFiltres.length : 0) +
                (filtre === 'tous' || filtre === 'pharmacies' ? pharmacies.length : 0) +
                (filtre === 'tous' || filtre === 'hopitaux' ? hopitaux.length : 0);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--sans)' }}>

      {/* NAV */}
      <nav style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem', height: '64px', flexShrink: 0, zIndex: 1000 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}>🏥</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', fontWeight: 700 }}>Dataforia<span style={{ color: 'var(--green)' }}>Santé</span></span>
        </Link>

        {/* Recherche */}
        <div style={{ flex: 1, maxWidth: '320px', position: 'relative' }}>
          <input
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="Rechercher médecin, spécialité, ville..."
            style={{ width: '100%', padding: '0.5rem 1rem', border: '1.5px solid var(--border)', borderRadius: '20px', fontSize: '0.82rem', outline: 'none', background: 'var(--green-pale)', fontFamily: 'var(--sans)' }}
          />
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {filtres.map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key)}
              style={{ padding: '5px 14px', borderRadius: '20px', border: '1.5px solid', borderColor: filtre === f.key ? f.color : 'var(--border)', background: filtre === f.key ? f.color : '#fff', color: filtre === f.key ? '#fff' : 'var(--ink-2)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
          <strong style={{ color: 'var(--ink)' }}>{total}</strong> résultats
        </div>
      </nav>

      {/* CARTE */}
      <div style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, fontSize: '0.875rem', color: 'var(--ink-3)' }}>
            Chargement de la carte...
          </div>
        )}

        <MapContainer
          center={[14.6928, -17.4467]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Position utilisateur */}
          {position && (
            <>
              <Marker position={position} icon={ICONS.user}>
                <Popup>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: '0.82rem' }}>
                    <strong>📍 Votre position</strong>
                  </div>
                </Popup>
              </Marker>
              <Circle center={position} radius={500} pathOptions={{ color: '#F59E0B', fillColor: '#FEF3C7', fillOpacity: 0.3 }} />
            </>
          )}

          {/* Médecins */}
          {(filtre === 'tous' || filtre === 'medecins') && medecinsFiltres.map(m => {
            const coords = getCoords(m.ville);
            return (
              <Marker key={`med-${m.id}`} position={coords} icon={ICONS.medecin}>
                <Popup maxWidth={280}>
                  <div style={{ fontFamily: 'var(--sans)', padding: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0E1510', marginBottom: '4px' }}>{m.nom}</div>
                    <div style={{ fontSize: '0.78rem', color: '#4A6358', marginBottom: '4px' }}>🩺 {m.spec}</div>
                    <div style={{ fontSize: '0.78rem', color: '#4A6358', marginBottom: '4px' }}>📍 {m.ville}</div>
                    <div style={{ fontSize: '0.78rem', color: '#4A6358', marginBottom: '8px' }}>💰 {m.prix?.toLocaleString('fr-FR')} FCFA · ⭐ {m.note}/5</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {(m.slots || []).slice(0, 3).map(s => (
                        <span key={s} style={{ background: '#E8F5EE', color: '#006B3F', fontSize: '0.68rem', fontWeight: 600, padding: '2px 7px', borderRadius: '5px' }}>{s}</span>
                      ))}
                    </div>
                    <a href={`/medecins/${m.id}`} style={{ display: 'block', width: '100%', padding: '6px', background: '#006B3F', color: '#fff', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>
                      Voir profil & RDV
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Pharmacies */}
          {(filtre === 'tous' || filtre === 'pharmacies') && pharmacies.map(p => {
            const coords = getCoords(p.ville);
            return (
              <Marker key={`pha-${p.id}`} position={[coords[0] + 0.002, coords[1] + 0.002]} icon={ICONS.pharmacie}>
                <Popup maxWidth={260}>
                  <div style={{ fontFamily: 'var(--sans)', padding: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0E1510', marginBottom: '4px' }}>{p.nom}</div>
                    <div style={{ fontSize: '0.78rem', color: '#4A6358', marginBottom: '4px' }}>📍 {p.ville}</div>
                    <div style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                      <span style={{ background: p.statut === 'ouverte' ? '#DCFCE7' : '#FEE2E2', color: p.statut === 'ouverte' ? '#166534' : '#DC2626', padding: '2px 7px', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700 }}>
                        {p.statut === 'ouverte' ? '✅ Ouverte' : '❌ Fermée'}
                      </span>
                      {p.garde && <span style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '2px 7px', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700, marginLeft: '4px' }}>🌙 Garde</span>}
                    </div>
                    {p.livraison && <div style={{ fontSize: '0.78rem', color: '#006B3F', marginBottom: '4px' }}>🚚 Livraison en {p.delai}</div>}
                    <div style={{ fontSize: '0.78rem', color: '#4A6358', marginBottom: '8px' }}>📞 {p.tel}</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a href={`tel:${p.tel}`} style={{ flex: 1, padding: '6px', border: '1.5px solid #0369A1', color: '#0369A1', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>
                        📞 Appeler
                      </a>
                      <a href="/ordonnance" style={{ flex: 1, padding: '6px', background: '#0369A1', color: '#fff', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>
                        📋 Ordonnance
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Hôpitaux */}
          {(filtre === 'tous' || filtre === 'hopitaux') && hopitaux.map(h => {
            const coords = getCoords(h.ville);
            return (
              <Marker key={`hop-${h.id}`} position={[coords[0] - 0.002, coords[1] - 0.002]} icon={ICONS.hopital}>
                <Popup maxWidth={280}>
                  <div style={{ fontFamily: 'var(--sans)', padding: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0E1510', marginBottom: '4px' }}>{h.nom}</div>
                    <div style={{ fontSize: '0.78rem', color: '#4A6358', marginBottom: '4px' }}>📍 {h.ville} · {h.type}</div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ background: h.statut === 'critique' ? '#FEE2E2' : h.statut === 'charge' ? '#FEF3C7' : '#DCFCE7', color: h.statut === 'critique' ? '#DC2626' : h.statut === 'charge' ? '#92400E' : '#166534', padding: '2px 7px', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700 }}>
                        {h.statut === 'critique' ? '🔴 Critique' : h.statut === 'charge' ? '🟠 Chargé' : '🟢 Normal'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                      <div style={{ background: '#F4FBF7', borderRadius: '6px', padding: '5px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: h.lits_libres > 5 ? '#006B3F' : '#DC2626' }}>{h.lits_libres}</div>
                        <div style={{ fontSize: '0.62rem', color: '#8FA99A' }}>Lits libres</div>
                      </div>
                      <div style={{ background: '#F4FBF7', borderRadius: '6px', padding: '5px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#DC2626' }}>{h.urgences}</div>
                        <div style={{ fontSize: '0.62rem', color: '#8FA99A' }}>Urgences</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {(h.services || []).slice(0, 3).map(s => (
                        <span key={s} style={{ background: '#E8F5EE', color: '#006B3F', fontSize: '0.62rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px' }}>{s}</span>
                      ))}
                    </div>
                    {h.lits_libres > 0 && (
                      <button
                        onClick={() => { const ref = `HOP-${Date.now()}`; window.location.href = `/paiement?montant=5000&medecin=${encodeURIComponent(h.nom)}&creneau=N/A&ref=${ref}&type=hopital`; }}
                        style={{ width: '100%', padding: '6px', background: '#006B3F', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                        📅 Prendre RDV
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Légende */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '1rem', zIndex: 500, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '0.85rem 1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Légende</div>
          {[
            { color: '#006B3F', label: '🩺 Médecins' },
            { color: '#0369A1', label: '💊 Pharmacies' },
            { color: '#DC2626', label: '🏥 Hôpitaux' },
            { color: '#F59E0B', label: '📍 Ma position' }
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-2)' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Bouton retour */}
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 500 }}>
          <Link to="/" style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.78rem', fontWeight: 500, color: 'var(--ink-2)', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            ← Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}