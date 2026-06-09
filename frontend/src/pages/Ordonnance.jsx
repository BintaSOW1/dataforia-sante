import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPharmacies, envoyerOrdonnance } from '../services/api';

export default function Ordonnance() {
  const [pharmacies, setPharmacies] = useState([]);
  const [form, setForm] = useState({
    patient_prenom: '', patient_nom: '', patient_tel: '',
    pharmacie_id: '', pharmacie_nom: '',
    medicaments: '', mode_reception: 'livraison'
  });
  const [fichier, setFichier] = useState(null);
  const [etape, setEtape] = useState(1);
  const [envoi, setEnvoi] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => { chargerPharmacies(); }, []);

  async function chargerPharmacies() {
    try {
      const res = await getPharmacies();
      setPharmacies(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleFichier(e) {
    const f = e.target.files[0];
    if (f) setFichier(f);
  }

  function validerEtape1() {
    if (!form.pharmacie_id) { setErreur('Veuillez choisir une pharmacie'); return; }
    setErreur('');
    setEtape(2);
  }

  function validerEtape2() {
    if (!form.medicaments && !fichier) { setErreur('Ajoutez une ordonnance ou saisissez les médicaments'); return; }
    setErreur('');
    setEtape(3);
  }

  async function soumettre() {
    if (!form.patient_prenom || !form.patient_nom || !form.patient_tel) {
      setErreur('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      setEnvoi(true);
      setErreur('');
      const res = await envoyerOrdonnance({
        patient_prenom: form.patient_prenom,
        patient_nom: form.patient_nom,
        patient_tel: form.patient_tel,
        pharmacie_id: parseInt(form.pharmacie_id),
        pharmacie_nom: form.pharmacie_nom,
        medicaments: form.medicaments,
        mode_reception: form.mode_reception
      });
      
      const ordo = res.data.data;

      // Rediriger vers le paiement
      window.location.href = `/paiement?montant=2500&medecin=${encodeURIComponent(ordo.pharmacie_nom)}&creneau=N/A&ref=${ordo.id}&type=ordonnance`;
    } catch (err) {
      setErreur('Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setEnvoi(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 0.9rem',
    border: '1.5px solid var(--border)', borderRadius: '10px',
    fontSize: '0.875rem', color: 'var(--ink)',
    background: 'var(--green-pale)', outline: 'none',
    fontFamily: 'var(--sans)', transition: 'border-color 0.2s'
  };

  const modeOptions = [
    { key: 'livraison', icon: '🚚', label: 'Livraison à domicile', sub: '45 min en moyenne' },
    { key: 'retrait', icon: '🏪', label: 'Retrait en pharmacie', sub: 'Prêt dans 30 min' },
    { key: 'urgence', icon: '⚡', label: 'Urgence Express', sub: 'Livraison en 20 min' }
  ];

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
          <Link to="/pharmacies" style={{ color: 'var(--ink-3)', margin: '0 4px' }}>Pharmacies</Link> ›
          <strong>Envoyer une ordonnance</strong>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg,#006B3F,#008B50)', padding: '100px 2rem 3rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,3vw,2.2rem)', color: '#fff', marginBottom: '0.75rem' }}>
            Envoyer une ordonnance
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Envoyez votre ordonnance directement à votre pharmacie. Elle prépare votre commande avant votre arrivée ou vous la livre.
          </p>

          {/* Indicateur étapes */}
          {!confirmation && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginTop: '2rem' }}>
              {[
                { num: 1, label: 'Pharmacie' },
                { num: 2, label: 'Ordonnance' },
                { num: 3, label: 'Confirmation' }
              ].map((e, i) => (
                <div key={e.num} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, background: etape >= e.num ? '#fff' : 'rgba(255,255,255,0.2)', color: etape >= e.num ? 'var(--green)' : 'rgba(255,255,255,0.6)' }}>{etape > e.num ? '✓' : e.num}</div>
                    <span style={{ fontSize: '0.65rem', color: etape >= e.num ? '#fff' : 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{e.label}</span>
                  </div>
                  {i < 2 && <div style={{ width: '60px', height: '2px', background: etape > e.num ? '#fff' : 'rgba(255,255,255,0.2)', margin: '0 4px 20px' }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTENU */}
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>

        {/* CONFIRMATION */}
        {confirmation && (
          <div style={{ background: '#fff', border: '1.5px solid #86EFAC', borderRadius: '20px', padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--green)', marginBottom: '0.75rem' }}>Ordonnance envoyée !</h2>
            <p style={{ color: 'var(--ink-2)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {confirmation.pharmacie_nom} a bien reçu votre ordonnance et va préparer votre commande.
            </p>
            <div style={{ background: 'var(--green-pale)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              {[
                { label: 'Patient', val: `${confirmation.patient_prenom} ${confirmation.patient_nom}` },
                { label: 'Téléphone', val: confirmation.patient_tel },
                { label: 'Pharmacie', val: confirmation.pharmacie_nom },
                { label: 'Mode', val: confirmation.mode_reception },
                { label: 'Référence', val: confirmation.id },
                { label: 'Statut', val: '⏳ En attente de traitement' }
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', gap: '10px', padding: '5px 0', borderBottom: '1px solid var(--green-light)', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--ink-3)', minWidth: '90px' }}>{r.label}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{r.val}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)', marginBottom: '1.5rem' }}>
              📱 Vous recevrez un SMS au {confirmation.patient_tel} quand votre commande sera prête.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setConfirmation(null); setEtape(1); setForm({ patient_prenom:'', patient_nom:'', patient_tel:'', pharmacie_id:'', pharmacie_nom:'', medicaments:'', mode_reception:'livraison' }); setFichier(null); }}
                style={{ flex: 1, padding: '0.75rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                Nouvelle ordonnance
              </button>
              <Link to="/pharmacies" style={{ flex: 1, padding: '0.75rem', textAlign: 'center', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '0.875rem', color: 'var(--ink-2)', textDecoration: 'none' }}>
                Retour pharmacies
              </Link>
            </div>
          </div>
        )}

        {/* ÉTAPE 1 — CHOISIR PHARMACIE */}
        {!confirmation && etape === 1 && (
          <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '1.5rem' }}>Choisissez votre pharmacie</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
              {pharmacies.map(p => (
                <div key={p.id} onClick={() => setForm(f => ({ ...f, pharmacie_id: p.id, pharmacie_nom: p.nom }))}
                  style={{ padding: '1rem', border: '1.5px solid', borderColor: form.pharmacie_id === p.id ? 'var(--green)' : 'var(--border)', borderRadius: '12px', cursor: 'pointer', background: form.pharmacie_id === p.id ? 'var(--green-pale)' : '#fff', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: form.pharmacie_id === p.id ? 'var(--green)' : 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>💊</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{p.nom}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)', marginTop: '2px' }}>
                      {p.ville} {p.livraison ? `· 🚚 Livraison ${p.delai}` : ''} {p.garde ? '· 🌙 Garde' : ''}
                    </div>
                  </div>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid', borderColor: form.pharmacie_id === p.id ? 'var(--green)' : 'var(--border)', background: form.pharmacie_id === p.id ? 'var(--green)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {form.pharmacie_id === p.id && <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
            {erreur && <div style={{ color: 'var(--red)', fontSize: '0.82rem', marginBottom: '1rem', background: '#FEE2E2', padding: '8px 12px', borderRadius: '8px' }}>{erreur}</div>}
            <button onClick={validerEtape1} style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              Continuer →
            </button>
          </div>
        )}

        {/* ÉTAPE 2 — ORDONNANCE */}
        {!confirmation && etape === 2 && (
          <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>Votre ordonnance</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-3)', marginBottom: '1.5rem' }}>Envoyée à : <strong style={{ color: 'var(--green)' }}>{form.pharmacie_nom}</strong></p>

            {/* Upload photo */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem' }}>📸 Photo de l'ordonnance</label>
              <label style={{ display: 'block', border: '2px dashed #BFDBFE', borderRadius: '12px', padding: '1.75rem', textAlign: 'center', cursor: 'pointer', background: fichier ? '#F0FDF4' : '#EFF6FF', transition: 'all 0.2s' }}>
                <input type="file" accept="image/*,.pdf" onChange={handleFichier} style={{ display: 'none' }} />
                {fichier ? (
                  <div>
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>✅</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--green)' }}>{fichier.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', marginTop: '3px' }}>{(fichier.size / 1024).toFixed(0)} Ko</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>📄</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0369A1' }}>Cliquez pour ajouter</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', marginTop: '3px' }}>JPG, PNG ou PDF · Max 10 Mo</div>
                  </div>
                )}
              </label>
            </div>

            {/* Séparateur */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>ou saisie manuelle</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            {/* Saisie médicaments */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>✏️ Médicaments prescrits</label>
              <textarea
                value={form.medicaments}
                onChange={e => setForm(f => ({ ...f, medicaments: e.target.value }))}
                placeholder="Ex: Paracétamol 500mg — 3x/jour pendant 5 jours&#10;Amoxicilline 500mg — 2x/jour pendant 7 jours"
                rows={4}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              />
            </div>

            {/* Mode de réception */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem' }}>🚚 Mode de réception</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {modeOptions.map(m => (
                  <div key={m.key} onClick={() => setForm(f => ({ ...f, mode_reception: m.key }))}
                    style={{ flex: 1, padding: '0.75rem 0.5rem', border: '1.5px solid', borderColor: form.mode_reception === m.key ? 'var(--green)' : 'var(--border)', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', background: form.mode_reception === m.key ? 'var(--green-pale)' : '#fff', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '3px' }}>{m.icon}</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: form.mode_reception === m.key ? 'var(--green)' : 'var(--ink)' }}>{m.label}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--ink-3)', marginTop: '2px' }}>{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {erreur && <div style={{ color: 'var(--red)', fontSize: '0.82rem', marginBottom: '1rem', background: '#FEE2E2', padding: '8px 12px', borderRadius: '8px' }}>{erreur}</div>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEtape(1)} style={{ flex: 1, padding: '0.75rem', background: '#fff', border: '1.5px solid var(--border)', borderRadius: '10px', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', color: 'var(--ink-2)', fontFamily: 'var(--sans)' }}>
                ← Retour
              </button>
              <button onClick={validerEtape2} style={{ flex: 2, padding: '0.75rem', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — INFOS PATIENT */}
        {!confirmation && etape === 3 && (
          <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>Vos informations</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-3)', marginBottom: '1.5rem' }}>Pour que la pharmacie puisse vous contacter.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Prénom *', key: 'patient_prenom', type: 'text', placeholder: 'Votre prénom' },
                { label: 'Nom *', key: 'patient_nom', type: 'text', placeholder: 'Votre nom de famille' },
                { label: 'Téléphone *', key: 'patient_tel', type: 'tel', placeholder: '+221 7X XXX XX XX' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: '5px' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={inputStyle} />
                </div>
              ))}
            </div>

            {/* Récap */}
            <div style={{ background: 'var(--green-pale)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>Récapitulatif</div>
              <div style={{ color: 'var(--ink-2)', lineHeight: 1.7 }}>
                💊 <strong>{form.pharmacie_nom}</strong><br />
                {form.mode_reception === 'livraison' ? '🚚 Livraison à domicile' : form.mode_reception === 'urgence' ? '⚡ Urgence Express' : '🏪 Retrait en pharmacie'}<br />
                {fichier && `📄 Fichier : ${fichier.name}`}
                {form.medicaments && `✏️ Médicaments saisis`}
              </div>
            </div>

            {erreur && <div style={{ color: 'var(--red)', fontSize: '0.82rem', marginBottom: '1rem', background: '#FEE2E2', padding: '8px 12px', borderRadius: '8px' }}>{erreur}</div>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEtape(2)} style={{ flex: 1, padding: '0.75rem', background: '#fff', border: '1.5px solid var(--border)', borderRadius: '10px', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', color: 'var(--ink-2)', fontFamily: 'var(--sans)' }}>
                ← Retour
              </button>
              <button onClick={soumettre} disabled={envoi} style={{ flex: 2, padding: '0.75rem', background: 'linear-gradient(135deg,#0369A1,#0284C7)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: envoi ? 0.7 : 1, fontFamily: 'var(--sans)' }}>
                {envoi ? 'Envoi...' : '📤 Envoyer l\'ordonnance'}
              </button>
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