import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../supabase';
import { getOrdonnances } from '../services/api';

export default function EspacePharmacie() {
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [ordonnances, setOrdonnances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState('dashboard');

  useEffect(() => { verifierAuth(); }, []);

  async function verifierAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/connexion'); return; }

    const { data: profil } = await supabase
      .from('profils')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profil || profil.role !== 'pharmacie') {
      navigate('/connexion'); return;
    }
    setProfil(profil);
    chargerOrdonnances(profil.pharmacie_id);
    setLoading(false);
  }

  async function chargerOrdonnances(pharmacieId) {
    try {
      const res = await getOrdonnances({ pharmacie_id: pharmacieId });
      setOrdonnances(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function seDeconnecter() {
    await supabase.auth.signOut();
    navigate('/connexion');
  }

  async function mettreAJourStatut(id, statut) {
    try {
      await fetch(`http://localhost:3000/api/ordonnances/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut })
      });
      setOrdonnances(prev => prev.map(o => o.id === id ? { ...o, statut } : o));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--sans)', color: 'var(--ink-3)' }}>
      Chargement...
    </div>
  );

  const enAttente = ordonnances.filter(o => o.statut === 'en_attente');
  const enCours = ordonnances.filter(o => o.statut === 'en_cours');
  const livrees = ordonnances.filter(o => o.statut === 'livre');

  const statutStyle = {
    en_attente: { bg: '#FEF3C7', color: '#92400E', label: '⏳ En attente' },
    en_cours: { bg: '#DBEAFE', color: '#1D4ED8', label: '🔄 En cours' },
    livre: { bg: '#DCFCE7', color: '#166534', label: '✅ Livré' },
    annule: { bg: '#FEE2E2', color: '#DC2626', label: '❌ Annulé' }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'var(--sans)', display: 'flex' }}>

      {/* SIDEBAR */}
      <div style={{ width: '240px', background: 'linear-gradient(180deg,#06101A,#0C1E30)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏥</div>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: '#fff', fontWeight: 700 }}>Dataforia<span style={{ color: '#FDEF42' }}>Santé</span></span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>💊</div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{profil?.prenom} {profil?.nom}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: '2px' }}>Pharmacie</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem' }}>
          {[
            { key: 'dashboard', icon: '📊', label: 'Dashboard' },
            { key: 'ordonnances', icon: '📋', label: 'Ordonnances' },
            { key: 'stock', icon: '💊', label: 'Stock' },
            { key: 'commandes', icon: '🛒', label: 'Commandes' }
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
        {onglet === 'dashboard' && (
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
              Tableau de bord 💊
            </h1>
            <p style={{ color: 'var(--ink-3)', fontSize: '0.85rem', marginBottom: '2rem' }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { icon: '⏳', label: 'En attente', val: enAttente.length, color: '#D97706' },
                { icon: '🔄', label: 'En cours', val: enCours.length, color: '#0369A1' },
                { icon: '✅', label: 'Livrées', val: livrees.length, color: '#006B3F' },
                { icon: '📋', label: 'Total', val: ordonnances.length, color: '#7C3AED' }
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '1.25rem', borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Ordonnances en attente */}
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1rem' }}>
                ⏳ Ordonnances en attente ({enAttente.length})
              </h3>
              {enAttente.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-3)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                  Toutes les ordonnances sont traitées
                </div>
              ) : (
                enAttente.map(o => (
                  <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', border: '1px solid #FDE68A', borderRadius: '10px', marginBottom: '8px', background: '#FFFBEB' }}>
                    <div style={{ fontSize: '1.5rem' }}>📋</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{o.patient_prenom} {o.patient_nom}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>📞 {o.patient_tel} · {o.mode_reception}</div>
                      {o.medicaments && <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', marginTop: '2px' }}>💊 {o.medicaments}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => mettreAJourStatut(o.id, 'en_cours')}
                        style={{ padding: '5px 10px', background: '#DBEAFE', color: '#1D4ED8', border: 'none', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                        🔄 Traiter
                      </button>
                      <button onClick={() => mettreAJourStatut(o.id, 'livre')}
                        style={{ padding: '5px 10px', background: '#DCFCE7', color: '#166534', border: 'none', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                        ✅ Livré
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ORDONNANCES */}
        {onglet === 'ordonnances' && (
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '1.5rem' }}>📋 Toutes les ordonnances</h1>
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              {ordonnances.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
                  Aucune ordonnance reçue
                </div>
              ) : (
                ordonnances.map(o => {
                  const s = statutStyle[o.statut] || statutStyle.en_attente;
                  return (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', border: '1.5px solid var(--border)', borderRadius: '12px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '1.5rem' }}>📋</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{o.patient_prenom} {o.patient_nom}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>📞 {o.patient_tel} · {o.mode_reception}</div>
                        {o.medicaments && <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', marginTop: '2px' }}>💊 {o.medicaments}</div>}
                        <div style={{ fontSize: '0.65rem', color: 'var(--ink-3)', marginTop: '2px', fontFamily: 'monospace' }}>{o.id}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span style={{ background: s.bg, color: s.color, fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: '8px' }}>{s.label}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {o.statut === 'en_attente' && (
                            <button onClick={() => mettreAJourStatut(o.id, 'en_cours')}
                              style={{ padding: '3px 8px', background: '#DBEAFE', color: '#1D4ED8', border: 'none', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                              🔄 Traiter
                            </button>
                          )}
                          {o.statut === 'en_cours' && (
                            <button onClick={() => mettreAJourStatut(o.id, 'livre')}
                              style={{ padding: '3px 8px', background: '#DCFCE7', color: '#166534', border: 'none', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                              ✅ Livré
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* STOCK */}
        {onglet === 'stock' && (
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '1.5rem' }}>💊 Gestion du stock</h1>
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💊</div>
                <p>Gestion du stock connectée à Supabase</p>
                <p style={{ fontSize: '0.82rem', marginTop: '8px' }}>Mise à jour en temps réel depuis le tableau de bord</p>
              </div>
            </div>
          </div>
        )}

        {/* COMMANDES */}
        {onglet === 'commandes' && (
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '1.5rem' }}>🛒 Commandes en cours</h1>
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              {ordonnances.filter(o => o.statut === 'en_cours').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛒</div>
                  Aucune commande en cours
                </div>
              ) : (
                ordonnances.filter(o => o.statut === 'en_cours').map(o => (
                  <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', border: '1.5px solid #BFDBFE', borderRadius: '12px', marginBottom: '10px', background: '#EFF6FF' }}>
                    <div style={{ fontSize: '1.5rem' }}>🛒</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{o.patient_prenom} {o.patient_nom}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>📞 {o.patient_tel} · 🚚 {o.mode_reception}</div>
                    </div>
                    <button onClick={() => mettreAJourStatut(o.id, 'livre')}
                      style={{ padding: '6px 14px', background: '#DCFCE7', color: '#166534', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                      ✅ Marquer livré
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}