import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../supabase';
import { getHopitaux } from '../services/api';

export default function EspaceHopital() {
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [hopital, setHopital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState('dashboard');
  const [litsLibres, setLitsLibres] = useState(0);
  const [urgences, setUrgences] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => { verifierAuth(); }, []);

  async function verifierAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/connexion'); return; }

    const { data: profil } = await supabase
      .from('profils')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profil || profil.role !== 'hopital') {
      navigate('/connexion'); return;
    }
    setProfil(profil);
    chargerHopital(profil.hopital_id);
    setLoading(false);
  }

  async function chargerHopital(hopitalId) {
    try {
      const res = await getHopitaux();
      const h = res.data.data.find(h => h.id === hopitalId) || res.data.data[0];
      setHopital(h);
      setLitsLibres(h.lits_libres);
      setUrgences(h.urgences);
    } catch (err) {
      console.error(err);
    }
  }

  async function mettreAJourLits() {
    try {
      setSaving(true);
      await fetch(`http://localhost:3000/api/hopitaux/${hopital.id}/lits`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lits_libres: litsLibres })
      });
      setHopital(prev => ({
        ...prev,
        lits_libres: litsLibres,
        occupation: Math.round(((prev.lits_total - litsLibres) / prev.lits_total) * 100)
      }));
      alert('✅ Mis à jour avec succès !');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function seDeconnecter() {
    await supabase.auth.signOut();
    navigate('/connexion');
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--sans)', color: 'var(--ink-3)' }}>
      Chargement...
    </div>
  );

  const statutColor = {
    normal: '#006B3F',
    charge: '#D97706',
    critique: '#DC2626'
  };

  const occupation = hopital ? Math.round(((hopital.lits_total - litsLibres) / hopital.lits_total) * 100) : 0;
  const barColor = occupation >= 90 ? '#DC2626' : occupation >= 75 ? '#F59E0B' : '#22C55E';

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'var(--sans)', display: 'flex' }}>

      {/* SIDEBAR */}
      <div style={{ width: '240px', background: 'linear-gradient(180deg,#06101A,#0E2840)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏥</div>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: '#fff', fontWeight: 700 }}>Dataforia<span style={{ color: '#FDEF42' }}>Santé</span></span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🏥</div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{hopital?.nom}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: '2px' }}>Administrateur</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem' }}>
          {[
            { key: 'dashboard', icon: '📊', label: 'Dashboard' },
            { key: 'lits', icon: '🛏️', label: 'Gestion des lits' },
            { key: 'urgences', icon: '🚨', label: 'Urgences' },
            { key: 'stats', icon: '📈', label: 'Statistiques' }
          ].map(item => (
            <button key={item.key} onClick={() => setOnglet(item.key)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', border: 'none', borderRadius: '10px', marginBottom: '4px', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '0.85rem', fontWeight: 500, textAlign: 'left', background: onglet === item.key ? 'rgba(255,255,255,0.15)' : 'transparent', color: onglet === item.key ? '#fff' : 'rgba(255,255,255,0.55)', transition: 'all 0.2s' }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', textDecoration: 'none', marginBottom: '8px' }}>← Retour accueil</Link>
          <button onClick={seDeconnecter} style={{ width: '100%', padding: '0.6rem', background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ marginLeft: '240px', flex: 1, padding: '2rem' }}>

        {/* DASHBOARD */}
        {onglet === 'dashboard' && hopital && (
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
              {hopital.nom} 🏥
            </h1>
            <p style={{ color: 'var(--ink-3)', fontSize: '0.85rem', marginBottom: '2rem' }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { icon: '🛏️', label: 'Lits libres', val: litsLibres, color: litsLibres > 5 ? '#006B3F' : '#DC2626' },
                { icon: '🏥', label: 'Lits total', val: hopital.lits_total, color: '#0369A1' },
                { icon: '🚨', label: 'Urgences', val: hopital.urgences, color: hopital.urgences > 2 ? '#DC2626' : '#D97706' },
                { icon: '📊', label: 'Occupation', val: occupation + '%', color: barColor }
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '1.25rem', borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Barre occupation */}
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1rem' }}>📊 Taux d'occupation</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--ink-3)', marginBottom: '8px' }}>
                <span>0%</span>
                <strong style={{ color: barColor }}>{occupation}%</strong>
                <span>100%</span>
              </div>
              <div style={{ height: '12px', background: 'var(--green-light)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${occupation}%`, background: barColor, borderRadius: '6px', transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--ink-2)' }}>Services : {(hopital.services || []).join(', ')}</span>
                <span style={{ background: hopital.statut === 'critique' ? '#FEE2E2' : hopital.statut === 'charge' ? '#FEF3C7' : '#DCFCE7', color: statutColor[hopital.statut], padding: '3px 10px', borderRadius: '8px', fontWeight: 700, fontSize: '0.72rem' }}>
                  {hopital.statut === 'critique' ? '🔴 Critique' : hopital.statut === 'charge' ? '🟠 Chargé' : '🟢 Normal'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* GESTION LITS */}
        {onglet === 'lits' && hopital && (
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '1.5rem' }}>🛏️ Gestion des lits</h1>
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.5rem', maxWidth: '500px' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1.25rem' }}>Mettre à jour la disponibilité</h3>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                  Lits libres (sur {hopital.lits_total} au total)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setLitsLibres(Math.max(0, litsLibres - 1))}
                    style={{ width: '36px', height: '36px', border: '1.5px solid var(--border)', borderRadius: '8px', background: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>−</button>
                  <input type="number" value={litsLibres} min={0} max={hopital.lits_total}
                    onChange={e => setLitsLibres(Math.min(hopital.lits_total, Math.max(0, parseInt(e.target.value) || 0)))}
                    style={{ flex: 1, padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)' }} />
                  <button onClick={() => setLitsLibres(Math.min(hopital.lits_total, litsLibres + 1))}
                    style={{ width: '36px', height: '36px', border: '1.5px solid var(--border)', borderRadius: '8px', background: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>+</button>
                </div>
              </div>

              <div style={{ background: 'var(--green-pale)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>
                  Nouveau taux d'occupation : <strong style={{ color: barColor }}>{occupation}%</strong>
                </div>
                <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${occupation}%`, background: barColor, borderRadius: '3px' }} />
                </div>
              </div>

              <button onClick={mettreAJourLits} disabled={saving}
                style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'var(--sans)' }}>
                {saving ? 'Sauvegarde...' : '💾 Mettre à jour'}
              </button>
            </div>
          </div>
        )}

        {/* URGENCES */}
        {onglet === 'urgences' && (
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '1.5rem' }}>🚨 File des urgences</h1>
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', marginBottom: '1.25rem', gap: '1rem' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: hopital?.urgences > 2 ? '#DC2626' : '#D97706', fontWeight: 700 }}>
                  {hopital?.urgences} urgence(s) en attente
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setUrgences(Math.max(0, urgences - 1))}
                    style={{ padding: '6px 14px', background: '#DCFCE7', color: '#166534', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '0.82rem' }}>
                    ✅ Traité
                  </button>
                  <button onClick={() => setUrgences(urgences + 1)}
                    style={{ padding: '6px 14px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '0.82rem' }}>
                    🚨 Nouveau
                  </button>
                </div>
              </div>
              <div style={{ background: hopital?.urgences > 2 ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${hopital?.urgences > 2 ? '#FECACA' : '#FDE68A'}`, borderRadius: '10px', padding: '1rem', fontSize: '0.82rem', color: hopital?.urgences > 2 ? '#DC2626' : '#92400E' }}>
                {hopital?.urgences > 2 ? '🔴 Situation critique — capacité d\'accueil dépassée' : hopital?.urgences > 0 ? '🟠 Situation chargée — surveillance recommandée' : '🟢 Aucune urgence en attente'}
              </div>
            </div>
          </div>
        )}

        {/* STATISTIQUES */}
        {onglet === 'stats' && hopital && (
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '1.5rem' }}>📈 Statistiques</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {[
                { label: 'Type d\'établissement', val: hopital.type },
                { label: 'Ville', val: hopital.ville },
                { label: 'Capacité totale', val: hopital.lits_total + ' lits' },
                { label: 'Lits libres', val: litsLibres + ' lits' },
                { label: 'Taux d\'occupation', val: occupation + '%' },
                { label: 'Urgences en attente', val: hopital.urgences },
                { label: 'Statut actuel', val: hopital.statut },
                { label: 'Services', val: (hopital.services || []).join(', ') }
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)' }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}