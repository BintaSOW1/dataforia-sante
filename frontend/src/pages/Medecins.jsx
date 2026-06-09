import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMedecins, creerRdv } from '../services/api';

export default function Medecins() {
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [ville, setVille] = useState('');
  const [modalRdv, setModalRdv] = useState(null);
  const [form, setForm] = useState({ prenom: '', nom: '', tel: '', email: '', creneau: '', motif: '' });
  const [envoi, setEnvoi] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { chargerMedecins(); }, []);

  async function chargerMedecins() {
    try {
      setLoading(true);
      const res = await getMedecins();
      setMedecins(res.data.data);
    } catch (err) {
      setErreur('Impossible de charger les médecins');
    } finally {
      setLoading(false);
    }
  }

  async function filtrer() {
    try {
      setLoading(true);
      const res = await getMedecins({ spec: recherche, ville });
      setMedecins(res.data.data);
    } catch (err) {
      setErreur('Erreur lors de la recherche');
    } finally {
      setLoading(false);
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
        setVille(villeProche.nom);
        try {
          setLoading(true);
          const res = await getMedecins({ ville: villeProche.nom });
          setMedecins(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
      },
      () => alert('Impossible de récupérer votre position.')
    );
  }

  async function confirmerRdv() {
    if (!form.prenom || !form.nom || !form.tel || !form.creneau) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      setEnvoi(true);
      const res = await creerRdv({
        medecin_id: modalRdv.id,
        medecin_nom: modalRdv.nom,
        specialite: modalRdv.spec,
        patient_prenom: form.prenom,
        patient_nom: form.nom,
        patient_tel: form.tel,
        patient_email: form.email,
        creneau: form.creneau,
        motif: form.motif
      });
      const rdv = res.data.data;
      setModalRdv(null);
      setForm({ prenom: '', nom: '', tel: '', email: '', creneau: '', motif: '' });
      window.location.href = `/paiement?montant=${modalRdv.prix}&medecin=${encodeURIComponent(modalRdv.nom)}&creneau=${encodeURIComponent(form.creneau)}&ref=${rdv.id}&type=consultation`;
    } catch (err) {
      alert('Erreur lors de la confirmation du RDV');
    } finally {
      setEnvoi(false);
    }
  }

  const medecinsFiltres = medecins.filter(m =>
    m.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    m.spec.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem', height: '64px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🏥</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', fontWeight: 700 }}>Dataforia<span style={{ color: 'var(--green)' }}>Santé</span></span>
        </Link>
        <div className="mobile-hide" style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>
          <Link to="/" style={{ color: 'var(--ink-3)' }}>Accueil</Link> › <strong>Médecins</strong>
        </div>
        <div className="nav-desktop-links" style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/hopitaux" style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>🏥 Hôpitaux</Link>
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
            { to: '/hopitaux', icon: '🏥', label: 'Hôpitaux' },
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

      {/* HERO SEARCH */}
      <section style={{ background: 'linear-gradient(160deg,#0E1510,#1A3020,#1F3D28)', padding: '80px 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem,3vw,2.5rem)', color: '#fff', marginBottom: '0.5rem' }}>
            Trouvez votre <em style={{ color: '#FDEF42' }}>médecin</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {medecins.length} médecins disponibles
          </p>

          {/* Barre de recherche */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input value={recherche} onChange={e => setRecherche(e.target.value)} onKeyDown={e => e.key === 'Enter' && filtrer()}
                placeholder="Spécialité ou nom du médecin..."
                style={{ flex: 1, minWidth: '200px', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', fontSize: '0.875rem', outline: 'none' }} />
              <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Ville..."
                style={{ width: '140px', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', fontSize: '0.875rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={filtrer} style={{ flex: 1, background: 'var(--green)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                🔍 Rechercher
              </button>
              <button onClick={autourDeMoi} style={{ flex: 1, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '0.75rem 1.25rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                📍 Autour de moi
              </button>
            </div>
          </div>

          {ville && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              📍 Résultats pour : <strong style={{ color: '#FDEF42' }}>{ville}</strong>
              <button onClick={() => { setVille(''); chargerMedecins(); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.78rem' }}>✕ Effacer</button>
            </div>
          )}

          {/* Spécialités rapides */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1rem' }}>
            {['Cardiologue', 'Pédiatre', 'Généraliste', 'Gynécologue', 'Dermatologue'].map(s => (
              <button key={s} onClick={() => { setRecherche(s); filtrer(); }}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.75)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--sans)', minHeight: 'auto' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>Chargement...</div>}
        {erreur && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--red)' }}>{erreur}</div>}

        {!loading && (
          <>
            <div style={{ marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--ink-3)' }}>
              <strong style={{ color: 'var(--ink)' }}>{medecinsFiltres.length}</strong> médecins trouvés
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {medecinsFiltres.map(m => (
                <div key={m.id} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '18px', overflow: 'hidden', transition: 'all 0.3s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,107,63,0.12)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ background: 'linear-gradient(135deg,#0E1510,#1A3020)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>👨‍⚕️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nom}</div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{m.spec}</div>
                    </div>
                    <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: '8px', flexShrink: 0 }}>✅</span>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--ink-2)' }}>📍 {m.ville}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--ink-2)' }}>⭐ {m.note}/5</div>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--green)', marginBottom: '0.85rem' }}>
                      {m.prix ? m.prix.toLocaleString('fr-FR') : '0'} FCFA
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                      {(m.slots || []).slice(0, 3).map(s => (
                        <span key={s} style={{ background: 'var(--green-light)', color: 'var(--green)', fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: '6px' }}>{s}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/medecins/${m.id}`} style={{ flex: 1, padding: '0.65rem', textAlign: 'center', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 500, color: 'var(--green)', textDecoration: 'none' }}>
                        Voir profil
                      </Link>
                      <button onClick={() => setModalRdv(m)} style={{ flex: 1, padding: '0.65rem', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                        📅 RDV
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {medecinsFiltres.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', border: '1.5px solid var(--border)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🩺</div>
                <h3 style={{ fontFamily: 'var(--serif)', color: 'var(--ink)', marginBottom: '0.5rem' }}>Aucun médecin trouvé</h3>
                <p style={{ color: 'var(--ink-3)', fontSize: '0.875rem' }}>Essayez une autre spécialité ou ville</p>
                <button onClick={chargerMedecins} style={{ marginTop: '1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '9px', padding: '0.65rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                  Voir tous les médecins
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL RDV */}
      {modalRdv && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}
          onClick={e => e.target === e.currentTarget && setModalRdv(null)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '500px', overflow: 'hidden', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ background: 'linear-gradient(135deg,#0E1510,#1A3020)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>👨‍⚕️</div>
              <div>
                <div style={{ color: '#fff', fontFamily: 'var(--serif)', fontSize: '1.05rem' }}>{modalRdv.nom}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>{modalRdv.spec} · {modalRdv.prix?.toLocaleString('fr-FR')} FCFA</div>
              </div>
              <button onClick={() => setModalRdv(null)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Choisissez un créneau *</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(modalRdv.slots || []).map(s => (
                  <button key={s} onClick={() => setForm(f => ({ ...f, creneau: s }))}
                    style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid', borderColor: form.creneau === s ? 'var(--green)' : 'var(--border)', background: form.creneau === s ? 'var(--green)' : 'var(--green-pale)', color: form.creneau === s ? '#fff' : 'var(--green)', cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
              {[
                { label: 'Prénom *', key: 'prenom', type: 'text', placeholder: 'Votre prénom' },
                { label: 'Nom *', key: 'nom', type: 'text', placeholder: 'Votre nom' },
                { label: 'Téléphone *', key: 'tel', type: 'tel', placeholder: '+221 7X XXX XX XX' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'votre@email.com' },
                { label: 'Motif', key: 'motif', type: 'text', placeholder: 'Motif de consultation' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem 0.85rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--ink)', background: 'var(--green-pale)', outline: 'none', fontFamily: 'var(--sans)' }} />
                </div>
              ))}
              <button onClick={confirmerRdv} disabled={envoi} style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: envoi ? 0.7 : 1, fontFamily: 'var(--sans)' }}>
                {envoi ? 'Création du RDV...' : '💳 Continuer vers le paiement'}
              </button>
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