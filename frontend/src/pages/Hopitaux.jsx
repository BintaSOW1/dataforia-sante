import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHopitaux, getHopitauxDisponibles } from '../services/api';

export default function Hopitaux() {
  const [hopitaux, setHopitaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { charger(); }, []);

  async function charger() {
    try {
      setLoading(true);
      const res = await getHopitaux();
      setHopitaux(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function filtrerDisponibles() {
    try {
      setLoading(true);
      setFiltre('disponibles');
      const res = await getHopitauxDisponibles();
      setHopitaux(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function filtrerTous() {
    setFiltre('tous');
    charger();
  }

  async function autourDeMoi() {
    if (!navigator.geolocation) { alert('Géolocalisation non supportée'); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const villes = [
          { nom: 'Dakar', lat: 14.6928, lon: -17.4467 },
          { nom: 'Thiès', lat: 14.7886, lon: -16.9260 },
          { nom: 'Saint-Louis', lat: 16.0209, lon: -16.4886 },
          { nom: 'Ziguinchor', lat: 12.5600, lon: -16.2719 },
          { nom: 'Kaolack', lat: 14.1392, lon: -16.0726 }
        ];
        const villeProche = villes.reduce((prev, curr) => {
          const distPrev = Math.sqrt(Math.pow(prev.lat - latitude, 2) + Math.pow(prev.lon - longitude, 2));
          const distCurr = Math.sqrt(Math.pow(curr.lat - latitude, 2) + Math.pow(curr.lon - longitude, 2));
          return distCurr < distPrev ? curr : prev;
        });
        try {
          setLoading(true);
          setFiltre('tous');
          const res = await getHopitaux({ ville: villeProche.nom });
          setHopitaux(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
      },
      () => alert('Impossible de récupérer votre position.')
    );
  }

  const statutColor = {
    normal: { bg: '#DCFCE7', color: '#166534', label: '🟢 Normal' },
    charge: { bg: '#FEF3C7', color: '#92400E', label: '🟠 Chargé' },
    critique: { bg: '#FEE2E2', color: '#DC2626', label: '🔴 Critique' }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem', height: '64px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🏥</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', fontWeight: 700 }}>Dataforia<span style={{ color: 'var(--green)' }}>Santé</span></span>
        </Link>
        <div className="mobile-hide" style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>
          <Link to="/" style={{ color: 'var(--ink-3)' }}>Accueil</Link> › <strong>Hôpitaux</strong>
        </div>
        <div className="nav-desktop-links" style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/medecins" style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>🩺 Médecins</Link>
          <Link to="/pharmacies" style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>💊 Pharmacies</Link>
          <Link to="/examens" style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>🔬 Examens</Link>
          <Link to="/connexion" style={{ background: 'var(--green)', color: '#fff', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>Connexion</Link>
        </div>

        {/* Hamburger */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none', transition: 'all 0.3s' }} />
          <span style={{ opacity: menuOpen ? 0 : 1, transition: 'all 0.3s' }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', transition: 'all 0.3s' }} />
        </button>
        <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
          {[
            { to: '/', icon: '🏠', label: 'Accueil' },
            { to: '/medecins', icon: '🩺', label: 'Médecins' },
            { to: '/pharmacies', icon: '💊', label: 'Pharmacies' },
            { to: '/examens', icon: '🔬', label: 'Examens' },
            { to: '/datobot', icon: '🤖', label: 'DatoBot' },
            { to: '/connexion', icon: '🔑', label: 'Connexion' },
          ].map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}>
              {l.icon} {l.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg,#0E1510,#1A3020,#1F3D28)', padding: '80px 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem,3vw,2.5rem)', color: '#fff', marginBottom: '0.5rem' }}>
            Hôpitaux & <em style={{ color: '#FDEF42' }}>Cliniques</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Disponibilité des lits en temps réel · Urgences 24h/24
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { key: 'tous', label: 'Tous les hôpitaux', fn: filtrerTous },
              { key: 'disponibles', label: '🛏️ Lits disponibles', fn: filtrerDisponibles }
            ].map(f => (
              <button key={f.key} onClick={f.fn}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid', borderColor: filtre === f.key ? 'var(--green)' : 'rgba(255,255,255,0.2)', background: filtre === f.key ? 'var(--green)' : 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer' }}>
                {f.label}
              </button>
            ))}
            <button onClick={autourDeMoi}
              style={{ padding: '0.6rem 1.25rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer' }}>
              📍 Autour de moi
            </button>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>Chargement...</div>}

        {!loading && (
          <>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)', marginBottom: '1.25rem' }}>
              <strong style={{ color: 'var(--ink)' }}>{hopitaux.length}</strong> établissement(s) trouvé(s)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {hopitaux.map(h => {
                const s = statutColor[h.statut] || statutColor.normal;
                const pct = h.occupation;
                const barColor = pct >= 90 ? '#DC2626' : pct >= 75 ? '#F59E0B' : '#22C55E';
                return (
                  <div key={h.id} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '18px', overflow: 'hidden', transition: 'all 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,107,63,0.1)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ background: 'linear-gradient(135deg,#0E1510,#1A3020)', padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>🏥</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{h.nom}</div>
                        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>{h.type} · {h.ville}</div>
                      </div>
                      <span style={{ background: s.bg, color: s.color, fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: '8px', flexShrink: 0 }}>{s.label}</span>
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      {/* Stats */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '1rem' }}>
                        {[
                          { val: h.lits_libres, label: 'Lits libres', color: h.lits_libres > 5 ? '#166534' : '#DC2626' },
                          { val: h.urgences, label: 'Urgences', color: h.urgences > 2 ? '#DC2626' : '#92400E' },
                          { val: h.lits_total, label: 'Lits total', color: 'var(--ink)' }
                        ].map(stat => (
                          <div key={stat.label} style={{ textAlign: 'center', background: 'var(--green-pale)', borderRadius: '10px', padding: '0.65rem' }}>
                            <div style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', fontWeight: 700, color: stat.color }}>{stat.val}</div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Barre occupation */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-3)', marginBottom: '4px' }}>
                          <span>Taux d'occupation</span>
                          <strong style={{ color: barColor }}>{pct}%</strong>
                        </div>
                        <div style={{ height: '6px', background: 'var(--green-light)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                        </div>
                      </div>

                      {/* Services */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1rem' }}>
                        {(h.services || []).map(sv => (
                          <span key={sv} style={{ background: 'var(--green-light)', color: 'var(--green)', fontSize: '0.67rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>{sv}</span>
                        ))}
                      </div>

                      <button onClick={() => {
                        if (h.lits_libres > 0) {
                          const ref = `HOP-${Date.now()}`;
                          window.location.href = `/paiement?montant=5000&medecin=${encodeURIComponent(h.nom)}&creneau=N/A&ref=${ref}&type=hopital`;
                        }
                      }}
                        style={{ width: '100%', padding: '0.75rem', background: h.lits_libres > 0 ? 'linear-gradient(135deg,var(--green),var(--green-mid))' : '#9CA3AF', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', cursor: h.lits_libres > 0 ? 'pointer' : 'not-allowed' }}>
                        {h.lits_libres > 0 ? '📅 Prendre RDV' : '❌ Complet'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {hopitaux.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', border: '1.5px solid var(--border)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
                <h3 style={{ fontFamily: 'var(--serif)', color: 'var(--ink)', marginBottom: '0.5rem' }}>Aucun hôpital trouvé</h3>
                <button onClick={charger} style={{ marginTop: '1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '9px', padding: '0.65rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                  Voir tous les hôpitaux
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,0.5)', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.82rem', marginTop: '4rem' }}>
        © 2024 DataforiaSanté · Sénégal 🇸🇳
      </footer>
    </div>
  );
}