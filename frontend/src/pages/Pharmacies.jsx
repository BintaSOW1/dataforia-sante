import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPharmacies, getMedicaments } from '../services/api';

export default function Pharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rechercheMed, setRechercheMed] = useState('');
  const [resultsMed, setResultsMed] = useState([]);
  const [loadingMed, setLoadingMed] = useState(false);
  const [onglet, setOnglet] = useState('pharmacies');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { charger(); }, []);

  async function charger() {
    try {
      setLoading(true);
      const res = await getPharmacies();
      setPharmacies(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function chercherMedicament() {
    if (!rechercheMed.trim()) return;
    try {
      setLoadingMed(true);
      const res = await getMedicaments(rechercheMed);
      setResultsMed(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMed(false);
    }
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
          const res = await getPharmacies({ ville: villeProche.nom });
          setPharmacies(res.data.data);
          setOnglet('pharmacies');
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
      },
      () => alert('Impossible de récupérer votre position.')
    );
  }

  const statutStyle = {
    ouverte: { bg: '#DCFCE7', color: '#166534', label: '✅ Ouverte' },
    fermee: { bg: '#FEE2E2', color: '#DC2626', label: '❌ Fermée' }
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
          <Link to="/" style={{ color: 'var(--ink-3)' }}>Accueil</Link> › <strong>Pharmacies</strong>
        </div>
        <div className="nav-desktop-links" style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/medecins" style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>🩺 Médecins</Link>
          <Link to="/hopitaux" style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>🏥 Hôpitaux</Link>
          <Link to="/ordonnance" style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: 600, background: 'var(--green-pale)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}>📋 Ordonnance</Link>
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
            { to: '/hopitaux', icon: '🏥', label: 'Hôpitaux' },
            { to: '/examens', icon: '🔬', label: 'Examens' },
            { to: '/ordonnance', icon: '📋', label: 'Ordonnance' },
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
      <section style={{ background: 'linear-gradient(160deg,#006B3F,#008B50,#15803D)', padding: '80px 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem,3vw,2.5rem)', color: '#fff', marginBottom: '0.5rem' }}>
            Pharmacies & <em style={{ color: '#FDEF42' }}>Médicaments</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Stock en temps réel · Livraison en 45 min · Ordonnances en ligne
          </p>

          {/* Onglets */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { key: 'pharmacies', label: '🏪 Pharmacies' },
              { key: 'medicaments', label: '💊 Médicaments' }
            ].map(o => (
              <button key={o.key} onClick={() => setOnglet(o.key)}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid', borderColor: onglet === o.key ? '#fff' : 'rgba(255,255,255,0.25)', background: onglet === o.key ? '#fff' : 'rgba(255,255,255,0.1)', color: onglet === o.key ? 'var(--green)' : '#fff', cursor: 'pointer' }}>
                {o.label}
              </button>
            ))}
            <button onClick={autourDeMoi}
              style={{ padding: '0.6rem 1.25rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer' }}>
              📍 Autour de moi
            </button>
          </div>

          {/* Recherche médicament */}
          {onglet === 'medicaments' && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input value={rechercheMed} onChange={e => setRechercheMed(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && chercherMedicament()}
                placeholder="Ex: Paracétamol, Amoxicilline..."
                style={{ flex: 1, minWidth: '200px', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', color: '#fff', fontSize: '0.875rem', outline: 'none' }} />
              <button onClick={chercherMedicament}
                style={{ background: '#fff', color: 'var(--green)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', width: '100%' }}>
                🔍 Vérifier le stock
              </button>
            </div>
          )}
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>

        {/* ONGLET PHARMACIES */}
        {onglet === 'pharmacies' && (
          <>
            {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>Chargement...</div>}
            {!loading && (
              <>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)', marginBottom: '1.25rem' }}>
                  <strong style={{ color: 'var(--ink)' }}>{pharmacies.length}</strong> pharmacies trouvées
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {pharmacies.map(p => {
                    const s = statutStyle[p.statut] || statutStyle.ouverte;
                    return (
                      <div key={p.id} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '18px', overflow: 'hidden', transition: 'all 0.3s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,107,63,0.1)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                        <div style={{ background: 'linear-gradient(135deg,#006B3F,#008B50)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>💊</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{p.ville}</div>
                          </div>
                          <span style={{ background: s.bg, color: s.color, fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: '8px', flexShrink: 0 }}>{s.label}</span>
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--ink-2)', marginBottom: '6px' }}>📞 {p.tel}</div>
                          {p.livraison && <div style={{ fontSize: '0.8rem', color: 'var(--green)', marginBottom: '6px' }}>🚚 Livraison en {p.delai}</div>}
                          {p.garde && <div style={{ fontSize: '0.8rem', color: '#0369A1', marginBottom: '6px' }}>🌙 Pharmacie de garde</div>}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                            <a href={`tel:${p.tel}`} style={{ flex: 1, padding: '0.65rem', textAlign: 'center', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 500, color: 'var(--green)', textDecoration: 'none' }}>📞 Appeler</a>
                            <Link to="/ordonnance" style={{ flex: 1, padding: '0.65rem', textAlign: 'center', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>📋 Ordonnance</Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ONGLET MÉDICAMENTS */}
        {onglet === 'medicaments' && (
          <div>
            {loadingMed && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>Recherche en cours...</div>}

            {!loadingMed && resultsMed.length === 0 && rechercheMed && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
                <div style={{ color: 'var(--ink-3)' }}>Aucun médicament trouvé pour "{rechercheMed}"</div>
              </div>
            )}

            {!loadingMed && resultsMed.length === 0 && !rechercheMed && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💊</div>
                <div style={{ color: 'var(--ink-3)', marginBottom: '1rem' }}>Tapez le nom d'un médicament pour vérifier sa disponibilité</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['Paracétamol', 'Amoxicilline', 'Ibuprofène', 'Metformine'].map(m => (
                    <button key={m} onClick={() => { setRechercheMed(m); setTimeout(chercherMedicament, 100); }}
                      style={{ background: 'var(--green-light)', color: 'var(--green)', border: '1px solid var(--border)', borderRadius: '20px', padding: '6px 14px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {resultsMed.map(med => (
                <div key={med.id} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--green-pale)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '1.5rem' }}>💊</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{med.nom}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>{med.categorie}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)' }}>{med.prix.toLocaleString('fr-FR')} FCFA</div>
                  </div>
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Disponible dans :</div>
                    {med.disponible_dans.length === 0 && <div style={{ color: '#DC2626', fontSize: '0.82rem' }}>❌ Rupture de stock dans toutes les pharmacies</div>}
                    {med.disponible_dans.map(ph => (
                      <div key={ph.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 0', borderBottom: '1px solid var(--green-light)', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1rem' }}>💊</span>
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>{ph.nom}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>{ph.ville} {ph.livraison ? `· 🚚 ${ph.delai}` : ''}</div>
                        </div>
                        <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>En stock</span>
                        <button onClick={() => {
                          const ref = `MED-${Date.now()}`;
                          window.location.href = `/paiement?montant=${med.prix}&medecin=${encodeURIComponent(ph.nom)}&creneau=N/A&ref=${ref}&type=medicament`;
                        }}
                          style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '7px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                          Commander
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,0.5)', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.82rem', marginTop: '4rem' }}>
        © 2024 DataforiaSanté · Sénégal 🇸🇳
      </footer>
    </div>
  );
}