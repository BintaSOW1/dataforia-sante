import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function Paiement() {
  const [searchParams] = useSearchParams();
  const [methodePaiement, setMethodePaiement] = useState(null);
  const [etape, setEtape] = useState(1);
  const [copie, setCopie] = useState(false);

  const montant = searchParams.get('montant') || '15000';
  const medecin = searchParams.get('medecin') || 'Dr. Moussa Diallo';
  const creneau = searchParams.get('creneau') || '09h00';
  const ref = searchParams.get('ref') || `RDV-${Date.now()}`;
  const type = searchParams.get('type') || 'consultation';

  const methodes = [
    {
      id: 'orange', nom: 'Orange Money', icon: '🟠', couleur: '#FF6600', bg: '#FFF3E0', border: '#FFB74D',
      numero: '+221 77 123 45 67',
      instructions: [
        'Composez *144# sur votre téléphone',
        'Choisissez "Transfert d\'argent"',
        'Entrez le numéro : +221 77 123 45 67',
        `Entrez le montant : ${parseInt(montant).toLocaleString('fr-FR')} FCFA`,
        `Entrez la référence : ${ref}`,
        'Validez avec votre code PIN'
      ]
    },
    {
      id: 'wave', nom: 'Wave', icon: '🔵', couleur: '#1877F2', bg: '#E3F2FD', border: '#90CAF9',
      numero: '+221 77 123 45 67',
      instructions: [
        'Ouvrez l\'application Wave',
        'Appuyez sur "Envoyer"',
        'Entrez le numéro : +221 77 123 45 67',
        `Entrez le montant : ${parseInt(montant).toLocaleString('fr-FR')} FCFA`,
        `Note : ${ref}`,
        'Confirmez le paiement'
      ]
    },
    {
      id: 'free', nom: 'Free Money', icon: '🟢', couleur: '#4CAF50', bg: '#E8F5E9', border: '#A5D6A7',
      numero: '+221 77 123 45 67',
      instructions: [
        'Composez *555# sur votre téléphone',
        'Choisissez "Transfert"',
        'Entrez le numéro : +221 77 123 45 67',
        `Entrez le montant : ${parseInt(montant).toLocaleString('fr-FR')} FCFA`,
        `Référence : ${ref}`,
        'Validez avec votre code PIN'
      ]
    }
  ];

  const typeConfig = {
    consultation: { icon: '📅', label: 'Rendez-vous médical', couleur: 'var(--green)' },
    teleconsultation: { icon: '💻', label: 'Téléconsultation vidéo', couleur: '#4338CA' },
    hopital: { icon: '🏥', label: 'Admission hôpital', couleur: '#0369A1' },
    medicament: { icon: '💊', label: 'Commande pharmacie', couleur: '#D97706' },
    ordonnance: { icon: '📋', label: 'Ordonnance pharmacie', couleur: '#7C3AED' },
    examen: { icon: '🔬', label: 'Examen médical', couleur: '#0369A1' }
  };

  const config = typeConfig[type] || typeConfig.consultation;

  function copierReference() {
    navigator.clipboard.writeText(ref);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  const methodeSelectionnee = methodes.find(m => m.id === methodePaiement);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem', height: '64px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🏥</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', fontWeight: 700 }}>Dataforia<span style={{ color: 'var(--green)' }}>Santé</span></span>
        </Link>
        <div className="mobile-hide" style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>
          <Link to="/" style={{ color: 'var(--ink-3)' }}>Accueil</Link> › <strong>Paiement</strong>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>← Retour</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg,#0E1510,#1A3020)', padding: '80px 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💳</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.5rem,3vw,2.2rem)', color: '#fff', marginBottom: '0.5rem' }}>
            Paiement <em style={{ color: '#FDEF42' }}>sécurisé</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Choisissez votre mode de paiement préféré
          </p>

          {/* Indicateur étapes */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[
              { num: 1, label: 'Méthode' },
              { num: 2, label: 'Instructions' },
              { num: 3, label: 'Confirmation' }
            ].map((e, i) => (
              <div key={e.num} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, background: etape >= e.num ? '#fff' : 'rgba(255,255,255,0.2)', color: etape >= e.num ? 'var(--green)' : 'rgba(255,255,255,0.6)' }}>
                    {etape > e.num ? '✓' : e.num}
                  </div>
                  <span style={{ fontSize: '0.6rem', color: etape >= e.num ? '#fff' : 'rgba(255,255,255,0.4)' }}>{e.label}</span>
                </div>
                {i < 2 && <div style={{ width: '40px', height: '2px', background: etape > e.num ? '#fff' : 'rgba(255,255,255,0.2)', margin: '0 4px 20px' }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>

        {/* RÉCAP COMMANDE */}
        <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
            {config.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{config.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {medecin} {creneau !== 'N/A' && `· ${creneau}`}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--ink-3)', fontFamily: 'monospace', marginTop: '2px' }}>
              Réf: {ref}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', fontWeight: 700, color: config.couleur }}>
              {parseInt(montant).toLocaleString('fr-FR')}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--ink-3)' }}>FCFA</div>
          </div>
        </div>

        {/* ÉTAPE 1 */}
        {etape === 1 && (
          <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1.25rem' }}>
              Choisissez votre méthode de paiement
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
              {methodes.map(m => (
                <div key={m.id} onClick={() => setMethodePaiement(m.id)}
                  style={{ padding: '1rem 1.25rem', border: '1.5px solid', borderColor: methodePaiement === m.id ? m.couleur : 'var(--border)', borderRadius: '12px', cursor: 'pointer', background: methodePaiement === m.id ? m.bg : '#fff', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '1.5rem' }}>{m.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{m.nom}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>Paiement mobile instantané</div>
                  </div>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid', borderColor: methodePaiement === m.id ? m.couleur : 'var(--border)', background: methodePaiement === m.id ? m.couleur : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {methodePaiement === m.id && <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => methodePaiement && setEtape(2)}
              style={{ width: '100%', padding: '0.9rem', background: methodePaiement ? 'linear-gradient(135deg,var(--green),var(--green-mid))' : '#E5E7EB', color: methodePaiement ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: methodePaiement ? 'pointer' : 'not-allowed', fontFamily: 'var(--sans)' }}>
              Continuer →
            </button>
          </div>
        )}

        {/* ÉTAPE 2 */}
        {etape === 2 && methodeSelectionnee && (
          <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '2rem' }}>{methodeSelectionnee.icon}</div>
              <div>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', color: 'var(--ink)', margin: 0 }}>
                  Payer via {methodeSelectionnee.nom}
                </h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>Suivez les instructions ci-dessous</div>
              </div>
            </div>

            {/* Montant */}
            <div style={{ background: methodeSelectionnee.bg, border: `1.5px solid ${methodeSelectionnee.border}`, borderRadius: '12px', padding: '1.25rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Montant à payer</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '2rem', fontWeight: 700, color: methodeSelectionnee.couleur }}>
                {parseInt(montant).toLocaleString('fr-FR')} FCFA
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)', marginTop: '4px' }}>
                Numéro : {methodeSelectionnee.numero}
              </div>
            </div>

            {/* Référence */}
            <div style={{ background: 'var(--green-pale)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Référence obligatoire</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ink)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ref}</div>
              </div>
              <button onClick={copierReference}
                style={{ background: copie ? 'var(--green)' : '#fff', color: copie ? '#fff' : 'var(--green)', border: '1.5px solid var(--green)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', flexShrink: 0 }}>
                {copie ? '✅' : '📋 Copier'}
              </button>
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Instructions</div>
              {methodeSelectionnee.instructions.map((instruction, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: methodeSelectionnee.couleur, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', lineHeight: 1.5, paddingTop: '2px' }}>{instruction}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEtape(1)}
                style={{ flex: 1, padding: '0.85rem', background: '#fff', border: '1.5px solid var(--border)', borderRadius: '10px', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', color: 'var(--ink-2)', fontFamily: 'var(--sans)' }}>
                ← Retour
              </button>
              <button onClick={() => setEtape(3)}
                style={{ flex: 2, padding: '0.85rem', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                ✅ J'ai payé
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — CONFIRMATION */}
        {etape === 3 && (
          <div style={{ background: '#fff', border: '1.5px solid #86EFAC', borderRadius: '20px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', color: 'var(--ink)', marginBottom: '0.75rem' }}>
              Paiement en cours de vérification
            </h2>
            <p style={{ color: 'var(--ink-2)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Nous allons vérifier votre paiement et confirmer dans les <strong>15 minutes</strong>.
            </p>

            <div style={{ background: 'var(--green-pale)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'left' }}>
              {[
                { label: 'Référence', val: ref },
                { label: 'Service', val: config.label },
                { label: 'Prestataire', val: medecin },
                { label: creneau !== 'N/A' ? 'Créneau' : '', val: creneau !== 'N/A' ? creneau : '' },
                { label: 'Montant', val: `${parseInt(montant).toLocaleString('fr-FR')} FCFA` },
                { label: 'Méthode', val: methodeSelectionnee?.nom || '' },
                { label: 'Statut', val: '⏳ En attente de confirmation' }
              ].filter(r => r.label).map(r => (
                <div key={r.label} style={{ display: 'flex', gap: '10px', padding: '5px 0', borderBottom: '1px solid var(--green-light)', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--ink-3)', minWidth: '80px', flexShrink: 0 }}>{r.label}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{r.val}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.78rem', color: '#92400E', textAlign: 'left' }}>
              📱 Vous recevrez une confirmation dès que votre paiement sera vérifié.
            </div>

            <Link to="/" style={{ display: 'block', width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', textAlign: 'center' }}>
              🏠 Retour à l'accueil
            </Link>
          </div>
        )}
      </main>

      <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,0.5)', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.82rem', marginTop: '4rem' }}>
        © 2024 DataforiaSanté · Sénégal 🇸🇳
      </footer>
    </div>
  );
}