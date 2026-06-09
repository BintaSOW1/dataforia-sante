import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getExamens, getStructuresExamen, analyserOrdonnance } from '../services/api';

const CATEGORIES = [
  { key: 'tous', label: 'Tous', icon: '🔬' },
  { key: 'biologie', label: 'Biologie', icon: '🩸' },
  { key: 'imagerie', label: 'Imagerie', icon: '📡' },
  { key: 'cardiologie', label: 'Cardio', icon: '🫀' }
];

const EXAMENS_POPULAIRES = ['NFS', 'Glycemie', 'Radiographie', 'Echographie', 'Groupe sanguin', 'Paludisme'];

export default function Examens() {
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorie, setCategorie] = useState('tous');
  const [recherche, setRecherche] = useState('');
  const [examenSelectionne, setExamenSelectionne] = useState(null);
  const [structures, setStructures] = useState([]);
  const [loadingStructures, setLoadingStructures] = useState(false);
  const [modeOrdonnance, setModeOrdonnance] = useState(false);
  const [imageOrdonnance, setImageOrdonnance] = useState(null);
  const [previewOrdonnance, setPreviewOrdonnance] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [resultatsOrdonnance, setResultatsOrdonnance] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { charger(); }, [categorie]);

  async function charger() {
    try {
      setLoading(true);
      const params = {};
      if (categorie !== 'tous') params.categorie = categorie;
      if (recherche) params.q = recherche;
      const res = await getExamens(params);
      setExamens(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function voirStructures(examen) {
    setExamenSelectionne(examen);
    try {
      setLoadingStructures(true);
      const res = await getStructuresExamen(examen.id);
      setStructures(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStructures(false);
    }
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setPreviewOrdonnance(base64);
      const base64Data = base64.split(',')[1];
      const mediaType = file.type || 'image/jpeg';
      setImageOrdonnance({ data: base64Data, type: mediaType });
    };
    reader.readAsDataURL(file);
  }

  async function analyser() {
    if (!imageOrdonnance) { alert('Veuillez choisir une image'); return; }
    try {
      setAnalysing(true);
      setResultatsOrdonnance(null);
      const res = await analyserOrdonnance({ image: imageOrdonnance.data, type: imageOrdonnance.type });
      setResultatsOrdonnance(res.data.data);
    } catch (err) {
      alert('Erreur lors de l\'analyse.');
      console.error(err);
    } finally {
      setAnalysing(false);
    }
  }

  function reinitialiser() {
    setImageOrdonnance(null);
    setPreviewOrdonnance(null);
    setResultatsOrdonnance(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const examensFiltres = examens.filter(e =>
    !recherche || e.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  const catColors = {
    biologie: { bg: '#DBEAFE', color: '#1D4ED8', icon: '🩸' },
    imagerie: { bg: '#EDE9FE', color: '#4338CA', icon: '📡' },
    cardiologie: { bg: '#FEE2E2', color: '#DC2626', icon: '🫀' },
    autre: { bg: '#DCFCE7', color: '#166534', icon: '🔬' }
  };

  const typeStructure = {
    laboratoire: { icon: '🧪', label: 'Laboratoire' },
    radiologie: { icon: '📡', label: 'Radiologie' },
    clinique: { icon: '🏥', label: 'Clinique' },
    hopital: { icon: '🏨', label: 'Hôpital' }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem', height: '64px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🏥</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', fontWeight: 700 }}>Dataforia<span style={{ color: 'var(--green)' }}>Santé</span></span>
        </Link>
        <div className="mobile-hide" style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>
          <Link to="/" style={{ color: 'var(--ink-3)' }}>Accueil</Link> › <strong>Examens & Analyses</strong>
        </div>
        <div className="nav-desktop-links" style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/medecins" style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>🩺 Médecins</Link>
          <Link to="/pharmacies" style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>💊 Pharmacies</Link>
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
            { to: '/hopitaux', icon: '🏥', label: 'Hôpitaux' },
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
      <section style={{ background: 'linear-gradient(160deg,#0E1510,#1A3020)', padding: '80px 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem,3vw,2.5rem)', color: '#fff', marginBottom: '0.5rem' }}>
            Examens & <em style={{ color: '#FDEF42' }}>Analyses</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Trouvez où réaliser vos analyses, radiographies et échographies.
          </p>

          {/* Toggle mode */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '4px', gap: '4px', marginBottom: '1.25rem' }}>
            <button onClick={() => setModeOrdonnance(false)}
              style={{ flex: 1, padding: '8px', borderRadius: '9px', border: 'none', background: !modeOrdonnance ? '#fff' : 'transparent', color: !modeOrdonnance ? 'var(--green)' : 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              🔍 Rechercher
            </button>
            <button onClick={() => setModeOrdonnance(true)}
              style={{ flex: 1, padding: '8px', borderRadius: '9px', border: 'none', background: modeOrdonnance ? '#fff' : 'transparent', color: modeOrdonnance ? 'var(--green)' : 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              📷 Scanner ordonnance
            </button>
          </div>

          {/* Mode recherche */}
          {!modeOrdonnance && (
            <>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                <input value={recherche} onChange={e => setRecherche(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && charger()}
                  placeholder="Ex: NFS, Radiographie, Échographie..."
                  style={{ flex: 1, minWidth: '200px', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', fontSize: '0.875rem', outline: 'none' }} />
                <button onClick={charger}
                  style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                  🔍
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem' }}>Populaires :</span>
                {EXAMENS_POPULAIRES.map(e => (
                  <button key={e} onClick={() => { setRecherche(e); charger(); }}
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.75)', borderRadius: '20px', padding: '3px 10px', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'var(--sans)', minHeight: 'auto' }}>
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Mode ordonnance */}
          {modeOrdonnance && (
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>📷 Prenez en photo votre ordonnance</div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                Notre IA détecte automatiquement les examens prescrits et vous indique où les réaliser.
              </p>
              {!previewOrdonnance ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImage} style={{ display: 'none' }} />
                  <button onClick={() => fileRef.current?.click()}
                    style={{ background: '#fff', color: 'var(--green)', border: 'none', borderRadius: '10px', padding: '0.85rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                    📸 Prendre une photo
                  </button>
                  <button onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute('capture'); fileRef.current.click(); } }}
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', padding: '0.85rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                    🖼️ Depuis la galerie
                  </button>
                </div>
              ) : (
                <div>
                  <img src={previewOrdonnance} alt="Ordonnance" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '0.85rem', background: 'rgba(0,0,0,0.3)' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={analyser} disabled={analysing}
                      style={{ flex: 2, background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.75rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--sans)', opacity: analysing ? 0.7 : 1 }}>
                      {analysing ? '🔄 Analyse...' : '🤖 Analyser'}
                    </button>
                    <button onClick={reinitialiser}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '0.75rem', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                      🔄 Changer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>

        {/* RÉSULTATS ORDONNANCE */}
        {modeOrdonnance && resultatsOrdonnance && (
          <div style={{ marginBottom: '2rem' }}>
            {resultatsOrdonnance.erreur ? (
              <div style={{ background: '#FEE2E2', border: '1.5px solid #FECACA', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚠️</div>
                <div style={{ color: '#DC2626', fontWeight: 600 }}>{resultatsOrdonnance.erreur}</div>
              </div>
            ) : (
              <div>
                <div style={{ background: '#fff', border: '1.5px solid #86EFAC', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--green)', marginBottom: '0.75rem' }}>
                    ✅ Ordonnance analysée
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '0.75rem' }}>
                    {resultatsOrdonnance.medecin && (
                      <div style={{ background: 'var(--green-pale)', borderRadius: '8px', padding: '0.65rem' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--ink-3)', marginBottom: '2px' }}>Médecin</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)' }}>👨‍⚕️ {resultatsOrdonnance.medecin}</div>
                      </div>
                    )}
                    {resultatsOrdonnance.patient && (
                      <div style={{ background: 'var(--green-pale)', borderRadius: '8px', padding: '0.65rem' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--ink-3)', marginBottom: '2px' }}>Patient</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)' }}>🧑 {resultatsOrdonnance.patient}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Examens détectés ({resultatsOrdonnance.examens?.length || 0})
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(resultatsOrdonnance.examens || []).map((e, i) => (
                      <span key={i} style={{ background: 'var(--green)', color: '#fff', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px' }}>
                        🔬 {e}
                      </span>
                    ))}
                  </div>
                </div>

                {resultatsOrdonnance.examens_details?.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--ink)', marginBottom: '0.75rem' }}>
                      Où réaliser vos examens ?
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {resultatsOrdonnance.examens_details.map((e, i) => {
                        const cat = catColors[e.categorie] || catColors.autre;
                        return (
                          <div key={i} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                              {cat.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)', marginBottom: '2px' }}>{e.nom}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--green)', fontWeight: 600 }}>
                                💰 {e.prix_min?.toLocaleString('fr-FR')} — {e.prix_max?.toLocaleString('fr-FR')} FCFA
                              </div>
                            </div>
                            <button onClick={() => voirStructures(e)}
                              style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                              Où le faire ?
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODE RECHERCHE */}
        {!modeOrdonnance && (
          <>
            {/* Catégories */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
              {CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setCategorie(cat.key)}
                  style={{ padding: '0.55rem 1rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, border: '1.5px solid', borderColor: categorie === cat.key ? 'var(--green)' : 'var(--border)', background: categorie === cat.key ? 'var(--green)' : '#fff', color: categorie === cat.key ? '#fff' : 'var(--ink-2)', cursor: 'pointer', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { icon: '🩸', label: 'Biologie', val: examens.filter(e => e.categorie === 'biologie').length, color: '#1D4ED8' },
                { icon: '📡', label: 'Imagerie', val: examens.filter(e => e.categorie === 'imagerie').length, color: '#4338CA' },
                { icon: '🫀', label: 'Cardiologie', val: examens.filter(e => e.categorie === 'cardiologie').length, color: '#DC2626' },
                { icon: '🧪', label: 'Structures', val: 8, color: '#006B3F' }
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '1rem', borderLeft: `4px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '1.3rem' }}>{s.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--ink-3)', marginTop: '2px' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Liste examens */}
            {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>Chargement...</div>}

            {!loading && (
              <>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)', marginBottom: '0.75rem' }}>
                  <strong style={{ color: 'var(--ink)' }}>{examensFiltres.length}</strong> examen(s) trouvé(s)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {examensFiltres.map(e => {
                    const cat = catColors[e.categorie] || catColors.autre;
                    return (
                      <div key={e.id} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '12px', transition: 'all 0.2s' }}
                        onMouseOver={ev => { ev.currentTarget.style.borderColor = 'var(--green)'; }}
                        onMouseOut={ev => { ev.currentTarget.style.borderColor = 'var(--border)'; }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                          {cat.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{e.nom}</span>
                            {e.ordonnance_requise && <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: '5px' }}>📋 Ordonnance</span>}
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--green)', fontWeight: 600 }}>💰 {e.prix_min?.toLocaleString('fr-FR')} — {e.prix_max?.toLocaleString('fr-FR')} FCFA</span>
                            <span style={{ color: 'var(--ink-3)' }}>⏱️ {e.delai_resultats}</span>
                          </div>
                          {e.preparation && e.preparation !== 'Aucune preparation' && (
                            <div style={{ fontSize: '0.72rem', color: '#D97706', marginTop: '2px' }}>⚠️ {e.preparation}</div>
                          )}
                        </div>
                        <button onClick={() => voirStructures(e)}
                          style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.55rem 0.85rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                          Où le faire ?
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {!loading && examensFiltres.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '16px', border: '1.5px solid var(--border)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
                <p style={{ color: 'var(--ink-3)', fontSize: '0.875rem' }}>Aucun examen trouvé</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL STRUCTURES — slide du bas sur mobile */}
      {examenSelectionne && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setExamenSelectionne(null)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '640px', overflow: 'hidden', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ background: 'linear-gradient(135deg,#0E1510,#1A3020)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#FDEF42', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }}>Où réaliser cet examen ?</div>
                <div style={{ color: '#fff', fontFamily: 'var(--serif)', fontSize: '1rem', marginBottom: '3px' }}>{examenSelectionne.nom}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                  💰 {examenSelectionne.prix_min?.toLocaleString('fr-FR')} — {examenSelectionne.prix_max?.toLocaleString('fr-FR')} FCFA · ⏱️ {examenSelectionne.delai_resultats}
                </div>
              </div>
              <button onClick={() => setExamenSelectionne(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1rem', cursor: 'pointer', flexShrink: 0 }}>✕</button>
            </div>

            {examenSelectionne.preparation && examenSelectionne.preparation !== 'Aucune preparation' && (
              <div style={{ background: '#FEF3C7', borderBottom: '1px solid #FDE68A', padding: '0.75rem 1.25rem', display: 'flex', gap: '8px' }}>
                <span>⚠️</span>
                <div style={{ fontSize: '0.78rem', color: '#92400E' }}>{examenSelectionne.preparation}</div>
              </div>
            )}

            {examenSelectionne.ordonnance_requise && (
              <div style={{ background: '#EFF6FF', borderBottom: '1px solid #BFDBFE', padding: '0.65rem 1.25rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>📋</span>
                <div style={{ fontSize: '0.78rem', color: '#1D4ED8', fontWeight: 500 }}>Ordonnance médicale requise</div>
              </div>
            )}

            <div style={{ padding: '1.25rem' }}>
              {loadingStructures && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-3)' }}>Chargement...</div>}

              {!loadingStructures && structures.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-3)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔬</div>
                  Aucune structure disponible
                </div>
              )}

              {!loadingStructures && structures.map((s, i) => {
                const struct = s.structures_medicales;
                const type = typeStructure[struct.type] || typeStructure.laboratoire;
                return (
                  <div key={i} style={{ border: '1.5px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '8px', background: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F4FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                        {type.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)', marginBottom: '2px' }}>{struct.nom}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>📍 {struct.ville}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>🕐 {struct.horaires}</div>
                        {struct.livraison_resultats && <div style={{ fontSize: '0.68rem', color: 'var(--green)', fontWeight: 500, marginTop: '2px' }}>🚚 Résultats à domicile</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: '1rem', fontWeight: 700, color: 'var(--green)' }}>
                          {s.prix?.toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
                      <a href={`tel:${struct.tel}`} style={{ flex: 1, padding: '0.6rem', border: '1.5px solid var(--green)', color: 'var(--green)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                        📞 Appeler
                      </a>
                      <button onClick={() => {
                        const ref = `EXM-${Date.now()}`;
                        window.location.href = `/paiement?montant=${s.prix}&medecin=${encodeURIComponent(struct.nom)}&creneau=N/A&ref=${ref}&type=examen`;
                      }}
                        style={{ flex: 1, padding: '0.6rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                        📅 Réserver
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,0.5)', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.82rem', marginTop: '4rem' }}>
        © 2024 DataforiaSanté · Sénégal 🇸🇳
      </footer>
    </div>
  );
}