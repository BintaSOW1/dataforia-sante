import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1600&q=70',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=70',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1600&q=70',
  'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=1600&q=70',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=1600&q=70'
];

const TEMOIGNAGES = [
  {
    nom: 'Aminata Diallo',
    ville: 'Dakar',
    texte: 'J\'ai trouvé un cardiologue en 2 minutes et pris RDV directement. Service incroyable !',
    note: 5,
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face'
  },
  {
    nom: 'Moussa Sarr',
    ville: 'Thiès',
    texte: 'La téléconsultation m\'a évité 3 heures de route. Mon médecin était disponible immédiatement.',
    note: 5,
    avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=80&h=80&fit=crop&crop=face'
  },
  {
    nom: 'Fatou Ndiaye',
    ville: 'Saint-Louis',
    texte: 'J\'ai pu envoyer mon ordonnance en photo et récupérer mes médicaments le lendemain.',
    note: 5,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=80&h=80&fit=crop&crop=face'
  }
];

const STATS = [
  { val: '1 200+', label: 'Médecins', icon: '👨‍⚕️' },
  { val: '350+', label: 'Pharmacies', icon: '💊' },
  { val: '85+', label: 'Hôpitaux', icon: '🏥' },
  { val: '14', label: 'Régions', icon: '🗺️' }
];

function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="nav-hamburger" onClick={() => setOpen(!open)}>
        <span style={{ transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none', transition: 'all 0.3s' }} />
        <span style={{ opacity: open ? 0 : 1, transition: 'all 0.3s' }} />
        <span style={{ transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none', transition: 'all 0.3s' }} />
      </button>
      <div className={`nav-mobile-menu ${open ? 'open' : ''}`}>
        {[
          { to: '/medecins', icon: '🩺', label: 'Médecins' },
          { to: '/hopitaux', icon: '🏥', label: 'Hôpitaux' },
          { to: '/pharmacies', icon: '💊', label: 'Pharmacies' },
          { to: '/teleconsultation', icon: '💻', label: 'Téléconsultation' },
          { to: '/examens', icon: '🔬', label: 'Examens & Analyses' },
          { to: '/articles', icon: '📰', label: 'Articles santé' },
          { to: '/datobot', icon: '🤖', label: 'DatoBot IA' },
          { to: '/connexion', icon: '🔑', label: 'Connexion' },
        ].map(l => (
          <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>
            {l.icon} {l.label}
          </Link>
        ))}
        <Link to="/connexion" onClick={() => setOpen(false)}
          style={{ background: 'var(--green)', color: '#fff', borderRadius: '10px', justifyContent: 'center', fontWeight: 700 }}>
          S'inscrire gratuitement
        </Link>
      </div>
    </>
  );
}

export default function Accueil() {
  const navigate = useNavigate();
  const [recherche, setRecherche] = useState('');
  const [categorie, setCategorie] = useState('medecins');
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  function chercher() {
    if (recherche.trim()) {
      navigate(`/${categorie}?q=${encodeURIComponent(recherche)}`);
    } else {
      navigate(`/${categorie}`);
    }
  }

  function autourDeMoi() {
    navigate(`/${categorie}?autour=1`);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0 3rem', height: '68px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🏥</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', fontWeight: 700 }}>Dataforia<span style={{ color: 'var(--green)' }}>Santé</span></span>
        </div>

        {/* Liens desktop */}
        <div className="nav-desktop-links" style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/medecins" style={{ fontSize: '0.85rem', color: 'var(--ink-2)', fontWeight: 500 }}>🩺 Médecins</Link>
          <Link to="/hopitaux" style={{ fontSize: '0.85rem', color: 'var(--ink-2)', fontWeight: 500 }}>🏥 Hôpitaux</Link>
          <Link to="/pharmacies" style={{ fontSize: '0.85rem', color: 'var(--ink-2)', fontWeight: 500 }}>💊 Pharmacies</Link>
          <Link to="/teleconsultation" style={{ fontSize: '0.85rem', color: 'var(--ink-2)', fontWeight: 500 }}>💻 Téléconsultation</Link>
          <Link to="/examens" style={{ fontSize: '0.85rem', color: 'var(--ink-2)', fontWeight: 500 }}>🔬 Examens</Link>
          <Link to="/articles" style={{ fontSize: '0.85rem', color: 'var(--ink-2)', fontWeight: 500 }}>📰 Articles</Link>
          <Link to="/connexion" style={{ fontSize: '0.85rem', color: 'var(--ink-2)', fontWeight: 500 }}>Connexion</Link>
          <Link to="/connexion" style={{ background: 'var(--green)', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>S'inscrire</Link>
        </div>

        {/* Hamburger mobile */}
        <HamburgerMenu />
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: '68px', background: 'linear-gradient(160deg,#0E1510 0%,#1A3020 55%,#1F3D28 100%)', minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg,#006B3F 33.3%,#FDEF42 33.3% 66.6%,#CD2027 66.6%)', zIndex: 3 }} />

        {/* Carrousel background */}
        {HERO_IMAGES.map((img, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: i === heroIndex ? 0.3 : 0, transition: 'opacity 1.5s ease-in-out', zIndex: 0 }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(14,21,16,0.88) 0%,rgba(26,48,32,0.78) 55%,rgba(31,61,40,0.72) 100%)', zIndex: 1 }} />

        {/* Indicateurs carrousel */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 2 }}>
          {HERO_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)}
              style={{ width: i === heroIndex ? '24px' : '8px', height: '8px', borderRadius: '4px', border: 'none', background: i === heroIndex ? '#FDEF42' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
          ))}
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="hero-grid">

            {/* Colonne gauche */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem', fontWeight: 500, padding: '5px 14px', borderRadius: '20px', marginBottom: '1.5rem' }}>
                🇸🇳 Plateforme santé numéro 1 au Sénégal
              </div>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,4vw,3.8rem)', color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
                Votre santé,<br />
                <em style={{ color: '#FDEF42' }}>simplifiée</em><br />
                au Sénégal
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '480px' }}>
                Trouvez un médecin, prenez rendez-vous en ligne, accédez aux pharmacies et laboratoires partout au Sénégal.
              </p>

              {/* BARRE DE RECHERCHE */}
              <div style={{ background: '#fff', borderRadius: '16px', padding: '8px', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--green-pale)', borderRadius: '10px', padding: '4px', flexShrink: 0 }}>
                  {[
                    { key: 'medecins', icon: '🩺', label: 'Médecin' },
                    { key: 'pharmacies', icon: '💊', label: 'Pharmacie' },
                    { key: 'hopitaux', icon: '🏥', label: 'Hôpital' }
                  ].map(c => (
                    <button key={c.key} onClick={() => setCategorie(c.key)}
                      style={{ padding: '7px 10px', borderRadius: '8px', border: 'none', background: categorie === c.key ? 'var(--green)' : 'transparent', color: categorie === c.key ? '#fff' : 'var(--ink-2)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
                <input value={recherche} onChange={e => setRecherche(e.target.value)} onKeyDown={e => e.key === 'Enter' && chercher()}
                  placeholder={categorie === 'medecins' ? 'Spécialité...' : categorie === 'pharmacies' ? 'Médicament...' : 'Hôpital...'}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--ink)', fontFamily: 'var(--sans)', padding: '0.5rem', minWidth: '80px' }} />
                <button onClick={autourDeMoi} style={{ background: 'var(--green-pale)', color: 'var(--green)', border: '1.5px solid var(--border)', borderRadius: '9px', padding: '0.6rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  📍
                </button>
                <button onClick={chercher} style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)', flexShrink: 0 }}>
                  🔍
                </button>
              </div>

              {/* Recherches rapides */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>Populaires :</span>
                {['Cardiologue', 'Pédiatre', 'Généraliste', 'Pharmacie de garde'].map(s => (
                  <button key={s} onClick={() => { setCategorie('medecins'); navigate(`/medecins?q=${encodeURIComponent(s)}`); }}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'var(--sans)', minHeight: 'auto' }}>
                    {s}
                  </button>
                ))}
              </div>

              {/* STATS */}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                {STATS.map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', color: '#FDEF42', fontWeight: 700 }}>{s.val}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne droite — Photos (cachée sur mobile) */}
            <div className="hero-images" style={{ position: 'relative', height: '520px' }}>
              <div style={{ position: 'absolute', top: '0', right: '0', width: '65%', height: '380px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                <img src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=500&q=80" alt="Médecin africaine"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=500&q=80'; }} />
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink)' }}>Dr. Fatou Ndiaye</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--ink-3)' }}>Disponible maintenant</div>
                  </div>
                </div>
              </div>

              <div style={{ position: 'absolute', bottom: '0', left: '0', width: '55%', height: '280px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', border: '3px solid rgba(255,255,255,0.1)' }}>
                <img src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&q=80" alt="Patient consultation"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80'; }} />
              </div>

              <div style={{ position: 'absolute', top: '30px', left: '10px', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,107,63,0.4)' }}>
                <div style={{ color: '#fff', fontSize: '0.7rem', marginBottom: '2px' }}>RDV confirmé ✅</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem' }}>Aujourd'hui à 14h30</div>
              </div>

              <div style={{ position: 'absolute', bottom: '160px', right: '-10px', background: '#fff', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>💻</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink)' }}>Téléconsultation</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--ink-3)' }}>En français & wolof</div>
              </div>

              <div style={{ position: 'absolute', top: '200px', left: '-10px', background: '#fff', borderRadius: '14px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex' }}>
                  {[
                    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=32&h=32&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=32&h=32&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=32&h=32&fit=crop&crop=face'
                  ].map((src, i) => (
                    <img key={i} src={src} alt="Patient" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #fff', objectFit: 'cover', marginLeft: i > 0 ? '-8px' : '0' }} />
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink)' }}>+12 000 patients</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--ink-3)' }}>nous font confiance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: '4rem 1.5rem', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Nos services</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.5rem,3vw,2.5rem)', color: 'var(--ink)', marginBottom: '0.75rem' }}>Tout ce dont vous avez besoin</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
              Une plateforme complète pour gérer votre santé et celle de votre famille.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1rem' }} className="card-grid-3">
            {[
              { icon: '🩺', title: 'Médecins', desc: 'Trouvez un spécialiste et prenez RDV en ligne en 2 minutes.', link: '/medecins', color: '#0E1510', img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=60' },
              { icon: '🏥', title: 'Hôpitaux', desc: 'Disponibilité de lits en temps réel, urgences 24h/24.', link: '/hopitaux', color: '#06101A', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=60' },
              { icon: '💊', title: 'Pharmacies', desc: 'Stock temps réel, commande et livraison en 45 minutes.', link: '/pharmacies', color: '#062010', img: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&q=60' }
            ].map(s => (
              <Link to={s.link} key={s.title} style={{ borderRadius: '20px', overflow: 'hidden', display: 'block', textDecoration: 'none', position: 'relative', height: '220px', transition: 'transform 0.3s, box-shadow 0.3s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${s.color} 40%, transparent)` }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem' }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: '#fff', marginBottom: '3px' }}>{s.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }} className="card-grid-3">
            <Link to="/teleconsultation" style={{ background: 'linear-gradient(135deg,#1E1B4B,#4338CA)', borderRadius: '20px', padding: '1.5rem', display: 'block', textDecoration: 'none', transition: 'transform 0.3s', position: 'relative', overflow: 'hidden' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>💻</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: '#fff', marginBottom: '0.4rem' }}>Téléconsultation</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Consultez en vidéo · Français & Wolof</div>
            </Link>
            <Link to="/examens" style={{ background: 'linear-gradient(135deg,#0C3A2D,#1A6B52)', borderRadius: '20px', padding: '1.5rem', display: 'block', textDecoration: 'none', transition: 'transform 0.3s', position: 'relative', overflow: 'hidden' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>🔬</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: '#fff', marginBottom: '0.4rem' }}>Examens & Analyses</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Trouvez où faire vos analyses</div>
            </Link>
            <div style={{ background: 'linear-gradient(135deg,#0A100A,#1A2B18)', borderRadius: '20px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>🔐</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: '#fff', marginBottom: '0.6rem' }}>Espace Pro</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: '👨‍⚕️ Médecin', link: '/connexion' },
                  { label: '💊 Pharmacie', link: '/connexion' },
                  { label: '🏥 Hôpital', link: '/connexion' }
                ].map(p => (
                  <Link key={p.label} to={p.link} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 500, textDecoration: 'none' }}>
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--paper)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Simple & rapide</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.5rem,3vw,2.2rem)', color: 'var(--ink)' }}>Comment ça marche ?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' }} className="card-grid-4">
            {[
              { num: '01', icon: '🔍', title: 'Recherchez', desc: 'Trouvez un médecin, une pharmacie ou un hôpital près de chez vous.' },
              { num: '02', icon: '📅', title: 'Prenez RDV', desc: 'Choisissez un créneau disponible et confirmez votre rendez-vous.' },
              { num: '03', icon: '💳', title: 'Payez', desc: 'Paiement sécurisé via Orange Money, Wave ou Free Money.' },
              { num: '04', icon: '✅', title: 'Consultez', desc: 'En cabinet ou en vidéo. Votre dossier médical est mis à jour automatiquement.' }
            ].map((e, i) => (
              <div key={e.num} style={{ textAlign: 'center', position: 'relative' }}>
                {i < 3 && <div style={{ position: 'absolute', top: '24px', left: '60%', right: '-40%', height: '2px', background: 'linear-gradient(90deg,var(--green),transparent)', zIndex: 0 }} className="mobile-hide" />}
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', margin: '0 auto 1rem', position: 'relative', zIndex: 1, boxShadow: '0 4px 16px rgba(0,107,63,0.3)' }}>
                  {e.icon}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--green)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '4px' }}>{e.num}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--ink)', marginBottom: '6px' }}>{e.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', lineHeight: 1.6 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section style={{ padding: '4rem 1.5rem', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Témoignages</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.5rem,3vw,2.2rem)', color: 'var(--ink)' }}>Ce que disent nos patients</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }} className="card-grid-3">
            {TEMOIGNAGES.map((t, i) => (
              <div key={i} style={{ background: 'var(--paper)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '1.5rem' }}>
                <div style={{ color: '#F59E0B', fontSize: '1.1rem', marginBottom: '0.85rem' }}>{'⭐'.repeat(t.note)}</div>
                <p style={{ color: 'var(--ink-2)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>"{t.texte}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={t.avatar} alt={t.nom}
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green)' }}
                    onError={e => { e.target.style.display = 'none'; }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{t.nom}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>📍 {t.ville}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', background: '#DCFCE7', color: '#166534', fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: '8px' }}>✅ Vérifié</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARTICLES SANTÉ */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--paper)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Blog santé</div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.3rem,3vw,2rem)', color: 'var(--ink)', margin: 0 }}>Articles & Conseils santé</h2>
            </div>
            <Link to="/articles" style={{ background: 'var(--green)', color: '#fff', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
              Voir tous →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }} className="card-grid-3">
            {[
              { emoji: '🦟', titre: 'Comment prévenir le paludisme au Sénégal', categorie: 'Maladies tropicales', auteur: 'Dr. Moussa Diallo', lecture: '5 min', catBg: '#FEF3C7', catColor: '#92400E', img: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=60' },
              { emoji: '🩸', titre: 'Diabète : comprendre et gérer votre glycémie', categorie: 'Maladies chroniques', auteur: 'Dr. Fatou Ndiaye', lecture: '7 min', catBg: '#FEE2E2', catColor: '#DC2626', img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&q=60' },
              { emoji: '👶', titre: 'Bien nourrir son enfant de 0 à 5 ans', categorie: "Santé de l'enfant", auteur: 'Dr. Fatou Ndiaye', lecture: '8 min', catBg: '#DBEAFE', catColor: '#1D4ED8', img: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=60' }
            ].map((a, i) => (
              <Link to="/articles" key={i} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden', textDecoration: 'none', transition: 'all 0.3s', display: 'block' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,107,63,0.1)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ height: '140px', overflow: 'hidden' }}>
                  <img src={a.img} alt={a.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ background: a.catBg, color: a.catColor, fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>{a.categorie}</span>
                    <span style={{ background: 'var(--green-light)', color: 'var(--green)', fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px' }}>⏱️ {a.lecture}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '0.4rem', lineHeight: 1.4 }}>{a.titre}</h3>
                  <div style={{ fontSize: '0.7rem', color: 'var(--ink-3)' }}>👨‍⚕️ {a.auteur}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '4rem 1.5rem', background: 'linear-gradient(135deg,#0E1510,#1A3020)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=40)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.05 }} />
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.5rem,3vw,2.5rem)', color: '#fff', marginBottom: '1rem', lineHeight: 1.2 }}>
            Besoin d'aide ? Parlez à <em style={{ color: '#FDEF42' }}>DatoBot</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Notre assistant IA est disponible 24h/24 pour vous aider en français et en wolof.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/datobot" style={{ background: 'var(--green)', color: '#fff', padding: '0.9rem 2rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(0,107,63,0.4)' }}>
              🤖 Parler à DatoBot
            </Link>
            <Link to="/medecins" style={{ border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.9rem 2rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)' }}>
              🩺 Trouver un médecin
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#070D07', color: 'rgba(255,255,255,0.4)', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }} className="card-grid-4">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏥</div>
                <span style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>Dataforia<span style={{ color: 'var(--green)' }}>Santé</span></span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.7, maxWidth: '260px' }}>La plateforme de santé numérique pour le Sénégal et l'Afrique de l'Ouest.</p>
            </div>
            {[
              { titre: 'Services', liens: [{ label: 'Médecins', to: '/medecins' }, { label: 'Hôpitaux', to: '/hopitaux' }, { label: 'Pharmacies', to: '/pharmacies' }, { label: 'Téléconsultation', to: '/teleconsultation' }, { label: 'Examens', to: '/examens' }] },
              { titre: 'Professionnels', liens: [{ label: 'Espace Médecin', to: '/connexion' }, { label: 'Espace Pharmacie', to: '/connexion' }, { label: 'Espace Hôpital', to: '/connexion' }] },
              { titre: 'Informations', liens: [{ label: 'Articles santé', to: '/articles' }, { label: 'DatoBot IA', to: '/datobot' }, { label: 'Mon dossier', to: '/dossier-medical' }] }
            ].map(col => (
              <div key={col.titre}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1rem' }}>{col.titre}</div>
                {col.liens.map(l => (
                  <Link key={l.label} to={l.to} style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '6px', textDecoration: 'none' }}
                    onMouseOver={e => e.target.style.color = 'rgba(255,255,255,0.8)'}
                    onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', flexWrap: 'wrap', gap: '1rem' }}>
            <span>© 2024 DataforiaSanté · Sénégal 🇸🇳</span>
            <span>Fait avec ❤️ pour la santé en Afrique</span>
          </div>
        </div>
      </footer>

      {/* BOUTON DATOBOT FLOTTANT */}
      <Link to="/datobot" style={{ position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 9999, width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 4px 20px rgba(0,107,63,0.45)', textDecoration: 'none', transition: 'all 0.3s' }}
        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,107,63,0.6)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,107,63,0.45)'; }}
        title="Parler à DatoBot">
        🤖
      </Link>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}