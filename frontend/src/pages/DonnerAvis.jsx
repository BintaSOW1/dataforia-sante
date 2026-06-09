import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAvis, donnerAvis } from '../services/api';

export default function DonnerAvis() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ note: 0, commentaire: '', patient_prenom: '', patient_nom: '', patient_tel: '' });
  const [hover, setHover] = useState(0);
  const [envoi, setEnvoi] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [erreur, setErreur] = useState('');
  const [avisExistants, setAvisExistants] = useState([]);
  const [loading, setLoading] = useState(true);

  const medecin_id = searchParams.get('medecin_id');
  const medecin_nom = searchParams.get('medecin_nom') || 'le médecin';
  const rdv_id = searchParams.get('rdv_id');

  useEffect(() => {
    if (medecin_id) chargerAvis();
  }, [medecin_id]);

  async function chargerAvis() {
    try {
      const res = await getAvis(medecin_id);
      setAvisExistants(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function soumettre() {
    if (!form.note) { setErreur('Veuillez sélectionner une note'); return; }
    if (!form.patient_prenom || !form.patient_nom || !form.patient_tel) { setErreur('Veuillez remplir tous les champs obligatoires'); return; }
    try {
      setEnvoi(true);
      setErreur('');
      await donnerAvis({
        medecin_id: parseInt(medecin_id),
        patient_prenom: form.patient_prenom,
        patient_nom: form.patient_nom,
        patient_tel: form.patient_tel,
        note: form.note,
        commentaire: form.commentaire,
        rdv_id
      });
      setConfirmation(true);
      chargerAvis();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setEnvoi(false);
    }
  }

  const etoiles = ['Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'];
  const noteColors = ['#DC2626', '#F59E0B', '#EAB308', '#22C55E', '#16A34A'];

  const inp = {
    width: '100%', padding: '0.75rem 0.9rem',
    border: '1.5px solid var(--border)', borderRadius: '10px',
    fontSize: '0.875rem', color: 'var(--ink)',
    background: 'var(--green-pale)', outline: 'none', fontFamily: 'var(--sans)'
  };

  const moyenne = avisExistants.length > 0
    ? (avisExistants.reduce((s, a) => s + a.note, 0) / avisExistants.length).toFixed(1)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0 2rem', height: '68px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏥</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 700 }}>Dataforia<span style={{ color: 'var(--green)' }}>Santé</span></span>
        </Link>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>
          <Link to="/" style={{ color: 'var(--ink-3)' }}>Accueil</Link> ›
          <Link to="/medecins" style={{ color: 'var(--ink-3)', margin: '0 4px' }}>Médecins</Link> ›
          <strong>Donner un avis</strong>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg,#0E1510,#1A3020)', padding: '100px 2rem 3rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,3vw,2.2rem)', color: '#fff', marginBottom: '0.75rem' }}>
            Votre avis sur <em style={{ color: '#FDEF42' }}>{medecin_nom}</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Votre expérience aide d'autres patients à choisir leur médecin. Merci de partager votre avis.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>

        {/* CONFIRMATION */}
        {confirmation && (
          <div style={{ background: '#fff', border: '1.5px solid #86EFAC', borderRadius: '20px', padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--green)', marginBottom: '0.75rem' }}>Merci pour votre avis !</h2>
            <p style={{ color: 'var(--ink-2)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Votre avis a été publié et aidera d'autres patients à choisir leur médecin.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link to="/medecins" style={{ padding: '0.75rem 1.5rem', background: 'var(--green)', color: '#fff', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                Voir d'autres médecins
              </Link>
              <Link to="/" style={{ padding: '0.75rem 1.5rem', border: '1.5px solid var(--border)', color: 'var(--ink-2)', borderRadius: '10px', fontSize: '0.875rem', textDecoration: 'none' }}>
                Retour accueil
              </Link>
            </div>
          </div>
        )}

        {/* FORMULAIRE AVIS */}
        {!confirmation && (
          <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '1.5rem' }}>Donnez votre note</h2>

            {/* Étoiles */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n}
                    onClick={() => setForm(f => ({ ...f, note: n }))}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '2.5rem', transition: 'transform 0.2s', transform: (hover || form.note) >= n ? 'scale(1.2)' : 'scale(1)', filter: (hover || form.note) >= n ? 'none' : 'grayscale(1) opacity(0.3)' }}>
                    ⭐
                  </button>
                ))}
              </div>
              {(hover || form.note) > 0 && (
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: noteColors[(hover || form.note) - 1] }}>
                  {etoiles[(hover || form.note) - 1]}
                </div>
              )}
            </div>

            {/* Critères */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
              {['Ponctualité', 'Écoute', 'Compétence', 'Accueil'].map(critere => (
                <div key={critere} style={{ background: 'var(--green-pale)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)', marginBottom: '4px' }}>{critere}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <span key={n} style={{ fontSize: '0.9rem', cursor: 'pointer', filter: form.note >= n ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Commentaire */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                Votre commentaire (optionnel)
              </label>
              <textarea
                value={form.commentaire}
                onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))}
                placeholder="Décrivez votre expérience avec ce médecin..."
                rows={4}
                style={{ ...inp, resize: 'none', lineHeight: 1.6 }}
              />
            </div>

            {/* Infos patient */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                Vos informations (non publiées)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: '5px' }}>Prénom *</label>
                  <input type="text" placeholder="Votre prénom" value={form.patient_prenom}
                    onChange={e => setForm(f => ({ ...f, patient_prenom: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: '5px' }}>Nom *</label>
                  <input type="text" placeholder="Votre nom" value={form.patient_nom}
                    onChange={e => setForm(f => ({ ...f, patient_nom: e.target.value }))} style={inp} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: '5px' }}>Téléphone *</label>
                  <input type="tel" placeholder="+221 7X XXX XX XX" value={form.patient_tel}
                    onChange={e => setForm(f => ({ ...f, patient_tel: e.target.value }))} style={inp} />
                </div>
              </div>
            </div>

            {erreur && (
              <div style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '0.82rem', padding: '10px 12px', borderRadius: '8px', marginBottom: '1rem' }}>
                ⚠️ {erreur}
              </div>
            )}

            <button onClick={soumettre} disabled={envoi}
              style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: envoi ? 0.7 : 1, fontFamily: 'var(--sans)' }}>
              {envoi ? 'Publication...' : '⭐ Publier mon avis'}
            </button>
          </div>
        )}

        {/* AVIS EXISTANTS */}
        {!loading && avisExistants.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--ink)', margin: 0 }}>
                Avis patients ({avisExistants.length})
              </h2>
              <div style={{ background: 'var(--green)', color: '#fff', borderRadius: '8px', padding: '4px 12px', fontSize: '0.82rem', fontWeight: 700 }}>
                ⭐ {moyenne}/5
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {avisExistants.map(a => (
                <div key={a.id} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                      {a.patient_prenom?.[0]}{a.patient_nom?.[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)' }}>
                        {a.patient_prenom} {a.patient_nom?.[0]}.
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--ink-3)' }}>
                        {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {a.verifie && <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>✅ Vérifié</span>}
                      </div>
                    </div>
                    <div style={{ color: '#F59E0B', fontSize: '1rem' }}>
                      {'⭐'.repeat(a.note)}{'☆'.repeat(5 - a.note)}
                    </div>
                  </div>
                  {a.commentaire && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>{a.commentaire}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,0.5)', padding: '2rem 3rem', textAlign: 'center', fontSize: '0.82rem', marginTop: '4rem' }}>
        © 2024 DataforiaSanté · Sénégal 🇸🇳
      </footer>
    </div>
  );
}