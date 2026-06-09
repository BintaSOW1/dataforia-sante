import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function BanniereRGPD() {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    const consentement = localStorage.getItem('dataforia_rgpd');
    if (!consentement) {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  function accepterTout() {
    localStorage.setItem('dataforia_rgpd', JSON.stringify({
      essentiel: true,
      analytique: true,
      date: new Date().toISOString()
    }));
    setVisible(false);
  }

  function refuserOptionnels() {
    localStorage.setItem('dataforia_rgpd', JSON.stringify({
      essentiel: true,
      analytique: false,
      date: new Date().toISOString()
    }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      {/* Overlay sombre */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998 }} />

      {/* Bannière */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, background: '#fff', borderTop: '3px solid var(--green)', boxShadow: '0 -8px 32px rgba(0,0,0,0.15)', padding: '1.25rem 1.5rem', fontFamily: 'var(--sans)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>🍪</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--ink)', marginBottom: '4px' }}>
                Votre vie privée nous importe
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>
                DataforiaSanté utilise des cookies pour assurer le bon fonctionnement de la plateforme et améliorer votre expérience. Vos données médicales sont protégées conformément à la loi sénégalaise sur la protection des données personnelles (CDP).
              </p>
            </div>
          </div>

          {/* Détails optionnels */}
          {details && (
            <div style={{ background: 'var(--green-pale)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  {
                    titre: '🔒 Cookies essentiels',
                    desc: 'Session de connexion, sécurité, préférences. Toujours actifs.',
                    actif: true,
                    obligatoire: true
                  },
                  {
                    titre: '📊 Cookies analytiques',
                    desc: 'Mesure d\'audience, amélioration du service. Optionnels.',
                    actif: false,
                    obligatoire: false
                  }
                ].map(cookie => (
                  <div key={cookie.titre} style={{ background: '#fff', borderRadius: '10px', padding: '0.85rem', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--ink)', marginBottom: '4px' }}>{cookie.titre}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: '6px' }}>{cookie.desc}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: cookie.obligatoire ? 'var(--ink-3)' : 'var(--green)' }}>
                      {cookie.obligatoire ? '🔒 Toujours actif' : '✅ Optionnel'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={accepterTout}
              style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.7rem 1.5rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              ✅ Accepter tout
            </button>
            <button onClick={refuserOptionnels}
              style={{ background: '#fff', color: 'var(--ink)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              Refuser les optionnels
            </button>
            <button onClick={() => setDetails(!details)}
              style={{ background: 'none', color: 'var(--green)', border: 'none', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--sans)', textDecoration: 'underline' }}>
              {details ? 'Masquer les détails' : 'Personnaliser'}
            </button>
            <Link to="/politique-confidentialite"
              style={{ fontSize: '0.75rem', color: 'var(--ink-3)', marginLeft: 'auto' }}>
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}