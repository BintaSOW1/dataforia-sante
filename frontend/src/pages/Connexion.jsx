import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../supabase';

export default function Connexion() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('connexion');
  const [role, setRole] = useState('medecin');
  const [form, setForm] = useState({ email: '', password: '', prenom: '', nom: '', tel: '' });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');

  const roles = [
    { key: 'medecin', icon: '👨‍⚕️', label: 'Médecin' },
    { key: 'pharmacie', icon: '💊', label: 'Pharmacie' },
    { key: 'hopital', icon: '🏥', label: 'Hôpital' },
    { key: 'patient', icon: '🧑', label: 'Patient' }
  ];

  const redirections = {
    medecin: '/espace-medecin',
    pharmacie: '/espace-pharmacie',
    hopital: '/espace-hopital',
    patient: '/'
  };

  async function seConnecter(e) {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      });
      if (error) throw error;
      const { data: profil } = await supabase.from('profils').select('*').eq('id', data.user.id).single();
      const roleUser = profil?.role || 'patient';
      navigate(redirections[roleUser] || '/');
    } catch (err) {
      setErreur(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  async function sInscrire(e) {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password
      });
      if (error) throw error;
      await supabase.from('profils').insert({
        id: data.user.id,
        role,
        prenom: form.prenom,
        nom: form.nom,
        tel: form.tel
      });
      navigate(redirections[role] || '/');
    } catch (err) {
      setErreur(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.85rem 0.9rem',
    border: '1.5px solid var(--border)',
    borderRadius: '10px',
    fontSize: '0.875rem',
    color: 'var(--ink)',
    background: 'var(--green-pale)',
    outline: 'none',
    fontFamily: 'var(--sans)'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem', height: '64px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🏥</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', fontWeight: 700 }}>Dataforia<span style={{ color: 'var(--green)' }}>Santé</span></span>
        </Link>
        <div style={{ marginLeft: 'auto' }}>
          <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>← Accueil</Link>
        </div>
      </nav>

      {/* CONTENU */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏥</div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '4px' }}>DataforiaSanté</h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>Plateforme santé numérique du Sénégal</p>
          </div>

          {/* Toggle connexion/inscription */}
          <div style={{ display: 'flex', background: '#fff', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem' }}>
            {[
              { key: 'connexion', label: 'Se connecter' },
              { key: 'inscription', label: 'S\'inscrire' }
            ].map(m => (
              <button key={m.key} onClick={() => setMode(m.key)}
                style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '9px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', background: mode === m.key ? 'var(--green)' : 'transparent', color: mode === m.key ? '#fff' : 'var(--ink-2)', transition: 'all 0.2s' }}>
                {m.label}
              </button>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '0.4rem' }}>
              {mode === 'connexion' ? 'Bienvenue !' : 'Créer un compte'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-3)', marginBottom: '1.25rem' }}>
              {mode === 'connexion' ? 'Connectez-vous à votre espace professionnel' : 'Rejoignez DataforiaSanté'}
            </p>

            {/* Sélecteur de rôle */}
            {mode === 'inscription' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Je suis un(e)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                  {roles.map(r => (
                    <div key={r.key} onClick={() => setRole(r.key)}
                      style={{ padding: '0.75rem 0.4rem', border: '1.5px solid', borderColor: role === r.key ? 'var(--green)' : 'var(--border)', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', background: role === r.key ? 'var(--green-pale)' : '#fff', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '1.3rem', marginBottom: '3px' }}>{r.icon}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: role === r.key ? 'var(--green)' : 'var(--ink-2)' }}>{r.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={mode === 'connexion' ? seConnecter : sInscrire}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {mode === 'inscription' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: '5px' }}>Prénom *</label>
                        <input type="text" placeholder="Prénom" value={form.prenom}
                          onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                          style={inputStyle} required />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: '5px' }}>Nom *</label>
                        <input type="text" placeholder="Nom" value={form.nom}
                          onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                          style={inputStyle} required />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: '5px' }}>Téléphone</label>
                      <input type="tel" placeholder="+221 7X XXX XX XX" value={form.tel}
                        onChange={e => setForm(f => ({ ...f, tel: e.target.value }))}
                        style={inputStyle} />
                    </div>
                  </>
                )}

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: '5px' }}>Email *</label>
                  <input type="email" placeholder="votre@email.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle} required />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: '5px' }}>Mot de passe *</label>
                  <input type="password" placeholder="••••••••" value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    style={inputStyle} required />
                </div>
              </div>

              {erreur && (
                <div style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '0.82rem', padding: '10px 12px', borderRadius: '8px', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚠️ {erreur}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: '100%', marginTop: '1.25rem', padding: '0.9rem', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'var(--sans)', boxShadow: '0 4px 16px rgba(0,107,63,0.3)' }}>
                {loading ? 'Chargement...' : mode === 'connexion' ? '🔐 Se connecter' : '✅ Créer mon compte'}
              </button>
            </form>

            {/* Connexion rapide médecin */}
            {mode === 'connexion' && (
              <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--green-pale)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', marginBottom: '4px' }}>Compte de démonstration</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-2)' }}>
                  Email : <strong>demo@dataforiasante.sn</strong><br />
                  Mot de passe : <strong>demo1234</strong>
                </div>
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--ink-3)', marginTop: '1rem' }}>
            <Link to="/" style={{ color: 'var(--green)' }}>← Retour à l'accueil</Link>
          </p>
        </div>
      </div>
    </div>
  );
}