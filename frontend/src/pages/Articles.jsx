import { useState } from 'react';
import { Link } from 'react-router-dom';

const ARTICLES = [
  {
    id: 1,
    titre: 'Comment prévenir le paludisme au Sénégal',
    categorie: 'Maladies tropicales',
    emoji: '🦟',
    auteur: 'Dr. Moussa Diallo',
    spec: 'Médecin généraliste',
    date: '15 janvier 2024',
    lecture: '5 min',
    image: '🦟',
    resume: 'Le paludisme reste l\'une des principales causes de mortalité au Sénégal. Découvrez les gestes simples pour vous protéger et protéger votre famille.',
    contenu: [
      { titre: 'Qu\'est-ce que le paludisme ?', texte: 'Le paludisme est une maladie infectieuse causée par un parasite transmis par la piqûre d\'un moustique femelle infecté. Il se manifeste par de la fièvre, des frissons, des maux de tête et des douleurs musculaires.' },
      { titre: 'Les gestes de prévention', texte: '• Dormir sous une moustiquaire imprégnée d\'insecticide\n• Porter des vêtements couvrants le soir\n• Utiliser des répulsifs anti-moustiques\n• Éliminer les eaux stagnantes autour de votre maison\n• Prendre un traitement préventif si recommandé par votre médecin' },
      { titre: 'Quand consulter ?', texte: 'Consultez immédiatement un médecin si vous présentez de la fièvre dans les semaines suivant une exposition potentielle. Le paludisme se traite efficacement s\'il est diagnostiqué tôt.' }
    ],
    tags: ['Paludisme', 'Prévention', 'Moustiques', 'Sénégal']
  },
  {
    id: 2,
    titre: 'Diabète : comprendre et gérer votre glycémie',
    categorie: 'Maladies chroniques',
    emoji: '🩸',
    auteur: 'Dr. Fatou Ndiaye',
    spec: 'Diabétologue',
    date: '22 janvier 2024',
    lecture: '7 min',
    resume: 'Le diabète touche des millions de personnes en Afrique de l\'Ouest. Apprenez à surveiller votre glycémie et à adopter un mode de vie sain.',
    contenu: [
      { titre: 'Les types de diabète', texte: 'Le diabète de type 1 est une maladie auto-immune. Le diabète de type 2, le plus courant, est souvent lié au mode de vie et à l\'alimentation. Il existe aussi le diabète gestationnel chez la femme enceinte.' },
      { titre: 'Surveiller sa glycémie', texte: 'Une glycémie normale à jeun est inférieure à 1.10 g/L. Entre 1.10 et 1.25 g/L, on parle de prédiabète. Au-delà de 1.26 g/L à deux reprises, le diagnostic de diabète est posé.' },
      { titre: 'Adopter un mode de vie sain', texte: '• Réduire les sucres rapides (sucreries, sodas, pain blanc)\n• Pratiquer 30 minutes d\'activité physique par jour\n• Maintenir un poids de forme\n• Consulter régulièrement votre médecin\n• Prendre vos médicaments selon prescription' }
    ],
    tags: ['Diabète', 'Glycémie', 'Alimentation', 'Chronique']
  },
  {
    id: 3,
    titre: 'Hypertension : le mal silencieux',
    categorie: 'Maladies chroniques',
    emoji: '🫀',
    auteur: 'Dr. Omar Diop',
    spec: 'Cardiologue',
    date: '1 février 2024',
    lecture: '6 min',
    resume: 'L\'hypertension artérielle touche 1 Sénégalais sur 3. Souvent asymptomatique, elle peut provoquer des accidents cardiovasculaires graves si elle n\'est pas traitée.',
    contenu: [
      { titre: 'Qu\'est-ce que l\'hypertension ?', texte: 'On parle d\'hypertension artérielle quand la pression du sang dans les artères est trop élevée. Elle est diagnostiquée quand la tension est supérieure à 140/90 mmHg de façon régulière.' },
      { titre: 'Facteurs de risque', texte: '• Alimentation trop salée\n• Sédentarité et surpoids\n• Stress chronique\n• Tabac et alcool\n• Antécédents familiaux\n• Âge (risque augmente après 40 ans)' },
      { titre: 'Comment se protéger ?', texte: 'Réduire la consommation de sel, faire de l\'exercice régulièrement, maintenir un poids sain, arrêter de fumer et consulter régulièrement son médecin pour mesurer sa tension.' }
    ],
    tags: ['Hypertension', 'Tension', 'Cardiovasculaire', 'Prévention']
  },
  {
    id: 4,
    titre: 'Bien nourrir son enfant de 0 à 5 ans',
    categorie: 'Santé de l\'enfant',
    emoji: '👶',
    auteur: 'Dr. Fatou Ndiaye',
    spec: 'Pédiatre',
    date: '10 février 2024',
    lecture: '8 min',
    resume: 'Les 1000 premiers jours de vie sont cruciaux pour le développement de votre enfant. Découvrez nos conseils pour une alimentation saine et équilibrée.',
    contenu: [
      { titre: 'L\'allaitement maternel', texte: 'L\'OMS recommande l\'allaitement maternel exclusif jusqu\'à 6 mois, puis en complément de la diversification alimentaire jusqu\'à 2 ans et plus. Le lait maternel contient tous les nutriments dont votre bébé a besoin.' },
      { titre: 'La diversification alimentaire', texte: 'À partir de 6 mois, introduisez progressivement les aliments solides : légumes, fruits, céréales, légumineuses, viandes. Évitez le sel, le sucre ajouté et les aliments ultra-transformés.' },
      { titre: 'Signaux d\'alerte', texte: 'Consultez rapidement si votre enfant refuse de manger depuis plus de 24h, perd du poids, présente une diarrhée ou des vomissements répétés, ou semble déshydraté.' }
    ],
    tags: ['Enfant', 'Alimentation', 'Allaitement', 'Pédiatrie']
  },
  {
    id: 5,
    titre: 'Grossesse : les consultations prénatales indispensables',
    categorie: 'Santé de la femme',
    emoji: '🤰',
    auteur: 'Dr. Aminata Mbaye',
    spec: 'Gynécologue-Obstétricienne',
    date: '18 février 2024',
    lecture: '6 min',
    resume: 'Un suivi prénatal régulier est essentiel pour la santé de la mère et du bébé. Voici les consultations à ne pas manquer pendant votre grossesse.',
    contenu: [
      { titre: 'Le calendrier des consultations', texte: 'Au Sénégal, il est recommandé d\'avoir au moins 4 consultations prénatales : au 1er trimestre (avant 12 semaines), à 4 mois, à 6 mois, et à 8 mois. Des consultations supplémentaires peuvent être nécessaires selon votre situation.' },
      { titre: 'Les examens importants', texte: '• Groupe sanguin et rhésus\n• NFS (numération formule sanguine)\n• Sérologies (syphilis, VIH, hépatite B)\n• Échographies (1ère, 2ème, 3ème trimestre)\n• Tension artérielle à chaque visite\n• Analyse d\'urine' },
      { titre: 'Les signaux d\'alarme', texte: 'Consultez en urgence si vous présentez : saignements vaginaux, douleurs abdominales intenses, maux de tête sévères, diminution des mouvements du bébé après 28 semaines, ou fièvre élevée.' }
    ],
    tags: ['Grossesse', 'Prénatal', 'Gynécologie', 'Femme']
  },
  {
    id: 6,
    titre: 'Comment bien utiliser les antibiotiques',
    categorie: 'Médicaments',
    emoji: '💊',
    auteur: 'Dr. Ibrahima Sow',
    spec: 'Médecin généraliste',
    date: '25 février 2024',
    lecture: '4 min',
    resume: 'La résistance aux antibiotiques est un problème majeur de santé publique. Apprenez à utiliser correctement ces médicaments pour préserver leur efficacité.',
    contenu: [
      { titre: 'Quand prendre des antibiotiques ?', texte: 'Les antibiotiques ne traitent que les infections bactériennes. Ils sont inefficaces contre les virus (rhume, grippe, COVID). Ne prenez des antibiotiques que sur prescription médicale.' },
      { titre: 'Comment bien les prendre ?', texte: '• Respectez la dose prescrite\n• Respectez les horaires de prise\n• Terminez toujours le traitement même si vous vous sentez mieux\n• Ne donnez pas vos antibiotiques à quelqu\'un d\'autre\n• Ne gardez pas d\'antibiotiques pour plus tard' },
      { titre: 'La résistance aux antibiotiques', texte: 'Quand les antibiotiques sont mal utilisés, les bactéries deviennent résistantes. Cela rend les infections plus difficiles à traiter. C\'est pourquoi il est crucial de respecter les prescriptions médicales.' }
    ],
    tags: ['Antibiotiques', 'Médicaments', 'Résistance', 'Prescription']
  }
];

const CATEGORIES = ['Toutes', 'Maladies tropicales', 'Maladies chroniques', 'Santé de l\'enfant', 'Santé de la femme', 'Médicaments'];

export default function Articles() {
  const [categorieActive, setCategorieActive] = useState('Toutes');
  const [articleOuvert, setArticleOuvert] = useState(null);
  const [recherche, setRecherche] = useState('');

  const articlesFiltres = ARTICLES.filter(a => {
    const matchCat = categorieActive === 'Toutes' || a.categorie === categorieActive;
    const matchRech = !recherche || a.titre.toLowerCase().includes(recherche.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(recherche.toLowerCase()));
    return matchCat && matchRech;
  });

  const catColors = {
    'Maladies tropicales': { bg: '#FEF3C7', color: '#92400E' },
    'Maladies chroniques': { bg: '#FEE2E2', color: '#DC2626' },
    'Santé de l\'enfant': { bg: '#DBEAFE', color: '#1D4ED8' },
    'Santé de la femme': { bg: '#FCE7F3', color: '#9D174D' },
    'Médicaments': { bg: '#DCFCE7', color: '#166534' }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0 2rem', height: '68px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏥</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 700 }}>Dataforia<span style={{ color: 'var(--green)' }}>Santé</span></span>
        </Link>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>
          <Link to="/" style={{ color: 'var(--ink-3)' }}>Accueil</Link> › <strong>Articles santé</strong>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
          <Link to="/medecins" style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>🩺 Médecins</Link>
          <Link to="/prevention" style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>💉 Prévention</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg,#0E1510,#1A3020)', padding: '100px 2rem 3rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,3vw,2.5rem)', color: '#fff', marginBottom: '0.5rem' }}>
            Santé & <em style={{ color: '#FDEF42' }}>Bien-être</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Articles rédigés par nos médecins pour vous informer et vous aider à prendre soin de votre santé.
          </p>
          <input value={recherche} onChange={e => setRecherche(e.target.value)}
            placeholder="Rechercher un article, une maladie, un symptôme..."
            style={{ width: '100%', maxWidth: '500px', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', fontSize: '0.875rem', outline: 'none' }} />
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* CATÉGORIES */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategorieActive(cat)}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid', borderColor: categorieActive === cat ? 'var(--green)' : 'var(--border)', background: categorieActive === cat ? 'var(--green)' : '#fff', color: categorieActive === cat ? '#fff' : 'var(--ink-2)', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* ARTICLE EN VEDETTE */}
        {categorieActive === 'Toutes' && !recherche && (
          <div onClick={() => setArticleOuvert(ARTICLES[0])}
            style={{ background: 'linear-gradient(135deg,#0E1510,#1A3020)', borderRadius: '20px', padding: '2.5rem', marginBottom: '2rem', cursor: 'pointer', display: 'flex', gap: '2rem', alignItems: 'center', transition: 'transform 0.3s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ fontSize: '5rem', flexShrink: 0 }}>{ARTICLES[0].emoji}</div>
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>{ARTICLES[0].categorie}</span>
                <span style={{ background: 'var(--green)', color: '#fff', fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>À la une</span>
              </div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.2rem,2vw,1.8rem)', color: '#fff', marginBottom: '0.75rem', lineHeight: 1.3 }}>{ARTICLES[0].titre}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>{ARTICLES[0].resume}</p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                <span>👨‍⚕️ {ARTICLES[0].auteur}</span>
                <span>📅 {ARTICLES[0].date}</span>
                <span>⏱️ {ARTICLES[0].lecture} de lecture</span>
              </div>
            </div>
          </div>
        )}

        {/* GRILLE ARTICLES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {articlesFiltres.map(a => {
            const cat = catColors[a.categorie] || { bg: 'var(--green-light)', color: 'var(--green)' };
            return (
              <div key={a.id} onClick={() => setArticleOuvert(a)}
                style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,107,63,0.1)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ background: 'var(--green-pale)', padding: '2rem', textAlign: 'center', fontSize: '3rem' }}>{a.emoji}</div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ background: cat.bg, color: cat.color, fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: '8px' }}>{a.categorie}</span>
                    <span style={{ background: 'var(--green-light)', color: 'var(--green)', fontSize: '0.68rem', fontWeight: 600, padding: '3px 9px', borderRadius: '8px' }}>⏱️ {a.lecture}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--ink)', marginBottom: '0.5rem', lineHeight: 1.4 }}>{a.titre}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: '1rem' }}>{a.resume.substring(0, 100)}...</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--ink-3)' }}>
                    <span>👨‍⚕️ {a.auteur}</span>
                    <span>📅 {a.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {articlesFiltres.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--serif)', color: 'var(--ink)', marginBottom: '0.5rem' }}>Aucun article trouvé</h3>
            <p style={{ color: 'var(--ink-3)', fontSize: '0.875rem' }}>Essayez un autre terme de recherche</p>
          </div>
        )}
      </main>

      {/* MODAL ARTICLE */}
      {articleOuvert && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => e.target === e.currentTarget && setArticleOuvert(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '700px', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#0E1510,#1A3020)', padding: '2rem', position: 'relative' }}>
              <button onClick={() => setArticleOuvert(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1rem', cursor: 'pointer' }}>✕</button>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{articleOuvert.emoji}</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
                <span style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px' }}>{articleOuvert.categorie}</span>
                <span style={{ background: 'var(--green)', color: '#fff', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px' }}>⏱️ {articleOuvert.lecture}</span>
              </div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.2rem,2vw,1.6rem)', color: '#fff', marginBottom: '0.75rem', lineHeight: 1.3 }}>{articleOuvert.titre}</h2>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', flexWrap: 'wrap' }}>
                <span>👨‍⚕️ {articleOuvert.auteur} · {articleOuvert.spec}</span>
                <span>📅 {articleOuvert.date}</span>
              </div>
            </div>

            {/* Contenu */}
            <div style={{ padding: '2rem' }}>
              <p style={{ color: 'var(--ink-2)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem', fontStyle: 'italic', borderLeft: '3px solid var(--green)', paddingLeft: '1rem' }}>
                {articleOuvert.resume}
              </p>
              {articleOuvert.contenu.map((section, i) => (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', color: 'var(--ink)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                    {section.titre}
                  </h3>
                  <p style={{ color: 'var(--ink-2)', fontSize: '0.875rem', lineHeight: 1.8, whiteSpace: 'pre-line', paddingLeft: '32px' }}>{section.texte}</p>
                </div>
              ))}

              {/* Tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                {articleOuvert.tags.map(tag => (
                  <span key={tag} style={{ background: 'var(--green-pale)', color: 'var(--green)', fontSize: '0.72rem', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border)' }}>#{tag}</span>
                ))}
              </div>

              {/* CTA */}
              <div style={{ background: 'var(--green-pale)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '1.5rem' }}>🩺</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)', marginBottom: '3px' }}>Besoin d'une consultation ?</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>Prenez rendez-vous avec un médecin spécialiste en quelques clics.</div>
                </div>
                <Link to="/medecins" style={{ background: 'var(--green)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '9px', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  Trouver un médecin
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,0.5)', padding: '2rem 3rem', textAlign: 'center', fontSize: '0.82rem', marginTop: '4rem' }}>
        © 2024 DataforiaSanté · Sénégal 🇸🇳
      </footer>
    </div>
  );
}