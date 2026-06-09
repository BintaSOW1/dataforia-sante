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

function createIcon(emoji, color) {
  return L.divIcon({
    html: `<div style="width:38px;height:38px;border-radius:50% 50% 50% 0;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:1rem;transform:rotate(-45deg)"><span style="transform:rotate(45deg)">${emoji}</span></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
    className: ''
  });
}

const ICONS = {
  medecin: createIcon('🩺', '#006B3F'),
  pharmacie: createIcon('💊', '#0369A1'),
  hopital: createIcon('🏥', '#DC2626'),
  user: createIcon('📍', '#F59E0B')
};

const COORDS = {
  'Dakar Plateau': [14.6937, -17.4441],
  'Plateau': [14.6937, -17.4441],
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
  return [14.6928 + (Math.random() - 0.5) * 0.05, -17.4467 + (Math.random() - 0.5) * 0.05];
}

function distance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function AutourDeMoi() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreurGeo, setErreurGeo] = useState(false);
  const [medecins, setMedecins] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [hopitaux, setHopitaux] = useState([]);
  const [filtre, setFiltre] = useState('tous');
  const [rayon, setRayon] = useState(5);
  const [onglet, setOnglet] = useState('carte');
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    chargerDonnees();
    localiser();
  }, []);

  async function chargerDonnees() {
    try {
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
    }
  }

  function localiser() {
    if (!navigator.geolocation) {
      setPosition([14.6928, -17.4467]);
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      () => {
        setErreurGeo(true);
        setPosition([14.6928, -17.4467]);
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }

  // Enrichir avec distance
  function avecDistance(liste) {
    if (!position) return liste;
    return liste.map(item => {
      const coords = getCoords(item.ville);
      const dist = distance(position[0], position[1], coords[0], coords[1]);
      return { ...item, coords, distance: dist };
    }).sort((a, b) => a.distance - b.distance);
  }

  const medecinsFiltres = avecDistance(medecins).filter(m =>
    m.distance <= rayon &&
    (!recherche || m.nom.toLowerCase().includes(recherche.toLowerCase()) ||
     m.spec.toLowerCase().includes(recherche.toLowerCase()))
  );

  const pharmaciesFiltres = avecDistance(pharmacies).filter(p => p.distance <= rayon);
  const hopitauxFiltres = avecDistance(hopitaux).filter(h => h.distance <= rayon);

  const totalResultats = (filtre === 'tous' || filtre === 'medecins' ? medecinsFiltres.length : 0) +
                         (filtre === 'tous' || filtre === 'pharmacies' ? pharmaciesFiltres.length : 0) +
                         (filtre === 'tous' || filtre === 'hopitaux' ? hopitauxFiltres.length : 0);

  const filtres = [
    { key: 'tous', label: '🗺️ Tout', count: totalResultats },
    { key: 'medecins', label: '🩺 Médecins', count: medecinsFiltres.length },
    { key: 'pharmacies', label: '💊 Pharmacies', count: pharmaciesFiltres.length },
    { key: 'hopitaux', label: '🏥 Hôpitaux', count: hopitauxFiltres.length }
  ];

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--sans)', background: 'var(--paper)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>📍</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>Localisation en cours...</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>Nous recherchons les soins autour de vous</div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--sans)' }}>

      {/* NAV */}
      <nav style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem', height: '64px', flexShrink: 0, zIndex: 1000 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}>🏥</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>Dataforia<span style={{ color: 'var(--green)' }}>Santé</span></span>
        </Link>

        {/* Titre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>📍 Autour de moi</span>
          {erreurGeo && <span style={{ fontSize: '0.7rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '8px' }}>⚠️ Position approximative</span>}
        </div>

        {/* Recherche */}
        <div style={{ flex: 1, maxWidth: '280px' }}>
          <input
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="Médecin, spécialité..."
            style={{ width: '100%', padding: '0.5rem 1rem', border: '1.5px solid var(--border)', borderRadius: '20px', fontSize: '0.82rem', outline: 'none', background: 'var(--green-pale)', fontFamily: 'var(--sans)' }}
          />
        </div>

        {/* Rayon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>Rayon :</span>
          {[2, 5, 10, 20].map(r => (
            <button key={r} onClick={() => setRayon(r)}
              style={{ padding: '4px 10px', borderRadius: '14px', border: '1.5px solid', borderColor: rayon === r ? 'var(--green)' : 'var(--border)', background: rayon === r ? 'var(--green)' : '#fff', color: rayon === r ? '#fff' : 'var(--ink-2)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              {r} km
            </button>
          ))}
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {filtres.map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key)}
              style={{ padding: '4px 12px', borderRadius: '14px', border: '1.5px solid', borderColor: filtre === f.key ? 'var(--green)' : 'var(--border)', background: filtre === f.key ? 'var(--green)' : '#fff', color: filtre === f.key ? '#fff' : 'var(--ink-2)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {f.label} <span style={{ background: filtre === f.key ? 'rgba(255,255,255,0.25)' : 'var(--green-light)', color: filtre === f.key ? '#fff' : 'var(--green)', borderRadius: '10px', padding: '0 5px', fontSize: '0.65rem', fontWeight: 700 }}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Toggle carte/liste */}
        <div style={{ marginLeft: 'auto', display: 'flex', background: 'var(--green-pale)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
          {[{ key: 'carte', icon: '🗺️' }, { key: 'liste', icon: '📋' }].map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              style={{ padding: '5px 10px', border: 'none', borderRadius: '6px', background: onglet === o.key ? '#fff' : 'transparent', cursor: 'pointer', fontSize: '0.85rem', boxShadow: onglet === o.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
              {o.icon}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* VUE CARTE */}
        {onglet === 'carte' && position && (
          <div style={{ flex: 1, position: 'relative' }}>
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={true}>
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Position + cercle rayon */}
              <Marker position={position} icon={ICONS.user}>
                <Popup><div style={{ fontFamily: 'var(--sans)', fontSize: '0.82rem' }}><strong>📍 Vous êtes ici</strong></div></Popup>
              </Marker>
              <Circle center={position} radius={rayon * 1000} pathOptions={{ color: '#006B3F', fillColor: '#E8F5EE', fillOpacity: 0.15, dashArray: '8' }} />

              {/* Médecins */}
              {(filtre === 'tous' || filtre === 'medecins') && medecinsFiltres.map(m => (
                <Marker key={`med-${m.id}`} position={m.coords} icon={ICONS.medecin}>
                  <Popup maxWidth={280}>
                    <div style={{ fontFamily: 'var(--sans)', padding: '4px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0E1510', marginBottom: '4px' }}>{m.nom}</div>
                      <div style={{ fontSize: '0.78rem', color: '#4A6358', marginBottom: '2px' }}>🩺 {m.spec}</div>
                      <div style={{ fontSize: '0.78rem', color: '#4A6358', marginBottom: '2px' }}>📍 {m.ville}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600, marginBottom: '2px' }}>📏 {m.distance.toFixed(1)} km de vous</div>
                      <div style={{ fontSize: '0.78rem', color: '#4A6358', marginBottom: '8px' }}>💰 {m.prix?.toLocaleString('fr-FR')} FCFA · ⭐ {m.note}/5</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {(m.slots || []).slice(0, 3).map(s => (
                          <span key={s} style={{ background: '#E8F5EE', color: '#006B3F', fontSize: '0.68rem', fontWeight: 600, padding: '2px 7px', borderRadius: '5px' }}>{s}</span>
                        ))}
                      </div>
                      <a href={`/medecins/${m.id}`} style={{ display: 'block', padding: '6px', background: '#006B3F', color: '#fff', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>
                        Voir profil & RDV
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Pharmacies */}
              {(filtre === 'tous' || filtre === 'pharmacies') && pharmaciesFiltres.map(p => (
                <Marker key={`pha-${p.id}`} position={[p.coords[0] + 0.001, p.coords[1] + 0.001]} icon={ICONS.pharmacie}>
                  <Popup maxWidth={260}>
                    <div style={{ fontFamily: 'var(--sans)', padding: '4px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0E1510', marginBottom: '4px' }}>{p.nom}</div>
                      <div style={{ fontSize: '0.78rem', color: '#4A6358', marginBottom: '2px' }}>📍 {p.ville}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600, marginBottom: '4px' }}>📏 {p.distance.toFixed(1)} km de vous</div>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        <span style={{ background: p.statut === 'ouverte' ? '#DCFCE7' : '#FEE2E2', color: p.statut === 'ouverte' ? '#166534' : '#DC2626', padding: '2px 7px', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700 }}>
                          {p.statut === 'ouverte' ? '✅ Ouverte' : '❌ Fermée'}
                        </span>
                        {p.garde && <span style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '2px 7px', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700 }}>🌙 Garde</span>}
                      </div>
                      {p.livraison && <div style={{ fontSize: '0.78rem', color: '#006B3F', marginBottom: '8px' }}>🚚 Livraison en {p.delai}</div>}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a href={`tel:${p.tel}`} style={{ flex: 1, padding: '6px', border: '1.5px solid #0369A1', color: '#0369A1', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>📞 Appeler</a>
                        <a href="/ordonnance" style={{ flex: 1, padding: '6px', background: '#0369A1', color: '#fff', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>📋 Ordonnance</a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Hôpitaux */}
              {(filtre === 'tous' || filtre === 'hopitaux') && hopitauxFiltres.map(h => (
                <Marker key={`hop-${h.id}`} position={[h.coords[0] - 0.001, h.coords[1] - 0.001]} icon={ICONS.hopital}>
                  <Popup maxWidth={280}>
                    <div style={{ fontFamily: 'var(--sans)', padding: '4px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0E1510', marginBottom: '4px' }}>{h.nom}</div>
                      <div style={{ fontSize: '0.78rem', color: '#4A6358', marginBottom: '2px' }}>📍 {h.ville}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600, marginBottom: '4px' }}>📏 {h.distance.toFixed(1)} km de vous</div>
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
                      {h.lits_libres > 0 && (
                        <button onClick={() => { const ref = `HOP-${Date.now()}`; window.location.href = `/paiement?montant=5000&medecin=${encodeURIComponent(h.nom)}&creneau=N/A&ref=${ref}&type=hopital`; }}
                          style={{ width: '100%', padding: '6px', background: '#006B3F', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                          📅 Prendre RDV
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Légende */}
            <div style={{ position: 'absolute', bottom: '2rem', left: '1rem', zIndex: 500, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '0.85rem 1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Légende</div>
              {[
                { color: '#F59E0B', label: '📍 Vous' },
                { color: '#006B3F', label: '🩺 Médecins' },
                { color: '#0369A1', label: '💊 Pharmacies' },
                { color: '#DC2626', label: '🏥 Hôpitaux' }
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-2)' }}>{l.label}</span>
                </div>
              ))}
              <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--border)', fontSize: '0.68rem', color: 'var(--ink-3)' }}>
                Cercle = {rayon} km autour de vous
              </div>
            </div>
          </div>
        )}

        {/* VUE LISTE */}
        {onglet === 'liste' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: 'var(--paper)' }}>

            {totalResultats === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', border: '1.5px solid var(--border)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>Aucun résultat dans ce rayon</h3>
                <p style={{ color: 'var(--ink-3)', fontSize: '0.875rem' }}>Essayez d'augmenter le rayon de recherche</p>
              </div>
            )}

            {/* Médecins */}
            {(filtre === 'tous' || filtre === 'medecins') && medecinsFiltres.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🩺 Médecins <span style={{ background: 'var(--green-light)', color: 'var(--green)', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px' }}>{medecinsFiltres.length}</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {medecinsFiltres.map(m => (
                    <div key={m.id} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,107,63,0.08)'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>👨‍⚕️</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '2px' }}>{m.nom}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>🩺 {m.spec} · 📍 {m.ville}</div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 700 }}>📏 {m.distance.toFixed(1)} km</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>⭐ {m.note}/5</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--green)' }}>{m.prix?.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px', marginTop: '5px', flexWrap: 'wrap' }}>
                          {(m.slots || []).slice(0, 3).map(s => (
                            <span key={s} style={{ background: 'var(--green-light)', color: 'var(--green)', fontSize: '0.68rem', fontWeight: 600, padding: '2px 7px', borderRadius: '5px' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                        <Link to={`/medecins/${m.id}`} style={{ padding: '6px 14px', background: 'var(--green)', color: '#fff', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                          Voir profil
                        </Link>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${m.coords[0]},${m.coords[1]}`} target="_blank" rel="noreferrer"
                          style={{ padding: '6px 14px', border: '1.5px solid var(--border)', color: 'var(--ink-2)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>
                          🗺️ Itinéraire
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pharmacies */}
            {(filtre === 'tous' || filtre === 'pharmacies') && pharmaciesFiltres.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💊 Pharmacies <span style={{ background: '#DBEAFE', color: '#0369A1', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px' }}>{pharmaciesFiltres.length}</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pharmaciesFiltres.map(p => (
                    <div key={p.id} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg,#0369A1,#0284C7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>💊</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '2px' }}>{p.nom}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>📍 {p.ville}</div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 700 }}>📏 {p.distance.toFixed(1)} km</span>
                          <span style={{ background: p.statut === 'ouverte' ? '#DCFCE7' : '#FEE2E2', color: p.statut === 'ouverte' ? '#166534' : '#DC2626', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px' }}>
                            {p.statut === 'ouverte' ? '✅ Ouverte' : '❌ Fermée'}
                          </span>
                          {p.garde && <span style={{ background: '#DBEAFE', color: '#1D4ED8', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px' }}>🌙 Garde</span>}
                          {p.livraison && <span style={{ fontSize: '0.72rem', color: 'var(--green)' }}>🚚 {p.delai}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                        <a href={`tel:${p.tel}`} style={{ padding: '6px 14px', border: '1.5px solid #0369A1', color: '#0369A1', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>📞 Appeler</a>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.coords[0]},${p.coords[1]}`} target="_blank" rel="noreferrer"
                          style={{ padding: '6px 14px', border: '1.5px solid var(--border)', color: 'var(--ink-2)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>
                          🗺️ Itinéraire
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hôpitaux */}
            {(filtre === 'tous' || filtre === 'hopitaux') && hopitauxFiltres.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏥 Hôpitaux <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px' }}>{hopitauxFiltres.length}</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {hopitauxFiltres.map(h => (
                    <div key={h.id} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg,#DC2626,#EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🏥</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '2px' }}>{h.nom}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>📍 {h.ville} · {h.type}</div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 700 }}>📏 {h.distance.toFixed(1)} km</span>
                          <span style={{ background: h.statut === 'critique' ? '#FEE2E2' : h.statut === 'charge' ? '#FEF3C7' : '#DCFCE7', color: h.statut === 'critique' ? '#DC2626' : h.statut === 'charge' ? '#92400E' : '#166534', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px' }}>
                            {h.statut === 'critique' ? '🔴 Critique' : h.statut === 'charge' ? '🟠 Chargé' : '🟢 Normal'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>🛏️ {h.lits_libres} lits libres</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                        {h.lits_libres > 0 && (
                          <button onClick={() => { const ref = `HOP-${Date.now()}`; window.location.href = `/paiement?montant=5000&medecin=${encodeURIComponent(h.nom)}&creneau=N/A&ref=${ref}&type=hopital`; }}
                            style={{ padding: '6px 14px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                            📅 RDV
                          </button>
                        )}
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.coords[0]},${h.coords[1]}`} target="_blank" rel="noreferrer"
                          style={{ padding: '6px 14px', border: '1.5px solid var(--border)', color: 'var(--ink-2)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>
                          🗺️ Itinéraire
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}