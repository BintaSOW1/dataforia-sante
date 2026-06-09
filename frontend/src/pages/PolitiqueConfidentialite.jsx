import { Link } from 'react-router-dom';

export default function PolitiqueConfidentialite() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem', height: '64px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#006B3F,#008B50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🏥</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', fontWeight: 700 }}>Dataforia<span style={{ color: 'var(--green)' }}>Santé</span></span>
        </Link>
        <div style={{ marginLeft: 'auto' }}>
          <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>← Accueil</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg,#0E1510,#1A3020)', padding: '80px 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Légal</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem,3vw,2.5rem)', color: '#fff', marginBottom: '0.5rem' }}>
            Politique de <em style={{ color: '#FDEF42' }}>Confidentialité</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>
            Dernière mise à jour : Juin 2024 · Conforme à la loi sénégalaise sur la protection des données personnelles (CDP)
          </p>
        </div>
      </section>

      {/* CONTENU */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Table des matières */}
        <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', color: 'var(--ink)', marginBottom: '1rem' }}>📋 Table des matières</h2>
          {[
            { num: '1', label: 'Qui sommes-nous ?' },
            { num: '2', label: 'Données collectées' },
            { num: '3', label: 'Finalités du traitement' },
            { num: '4', label: 'Base légale' },
            { num: '5', label: 'Durée de conservation' },
            { num: '6', label: 'Partage des données' },
            { num: '7', label: 'Vos droits' },
            { num: '8', label: 'Sécurité des données' },
            { num: '9', label: 'Cookies' },
            { num: '10', label: 'Contact' }
          ].map(item => (
            <a key={item.num} href={`#section-${item.num}`}
              style={{ display: 'flex', gap: '10px', padding: '6px 0', borderBottom: '1px solid var(--green-light)', fontSize: '0.85rem', color: 'var(--green)', textDecoration: 'none' }}>
              <span style={{ fontWeight: 700, minWidth: '20px' }}>{item.num}.</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        {/* Sections */}
        {[
          {
            id: '1',
            titre: '1. Qui sommes-nous ?',
            icon: '🏥',
            contenu: `DataforiaSanté est une plateforme de santé numérique opérant au Sénégal. Nous mettons en relation patients, médecins, pharmacies et hôpitaux via une interface numérique sécurisée.

Responsable du traitement :
- Nom : DataforiaSanté
- Pays : Sénégal
- Email : contact@dataforiasante.sn
- Site web : https://dataforia-sante.vercel.app`
          },
          {
            id: '2',
            titre: '2. Données collectées',
            icon: '📊',
            contenu: `Nous collectons les données suivantes :

Données d'identification :
- Nom et prénom
- Numéro de téléphone
- Adresse email

Données médicales (données sensibles) :
- Dossier médical (consultations, diagnostics, ordonnances)
- Constantes vitales (tension, poids, glycémie, température, pouls)
- Historique de vaccinations
- Groupe sanguin, taille, poids
- Allergies et antécédents médicaux
- Traitements en cours

Données de navigation :
- Adresse IP
- Type de navigateur
- Pages visitées
- Durée des sessions`
          },
          {
            id: '3',
            titre: '3. Finalités du traitement',
            icon: '🎯',
            contenu: `Vos données sont utilisées pour :

- Gérer votre compte et votre profil
- Permettre la prise de rendez-vous médicaux
- Gérer votre dossier médical numérique
- Faciliter les téléconsultations
- Envoyer des confirmations et rappels de RDV
- Vérifier la disponibilité des médicaments
- Améliorer nos services
- Assurer la sécurité de la plateforme
- Respecter nos obligations légales`
          },
          {
            id: '4',
            titre: '4. Base légale',
            icon: '⚖️',
            contenu: `Le traitement de vos données repose sur :

- Votre consentement explicite (article 5 de la loi sénégalaise sur la protection des données)
- L'exécution du contrat de service
- L'intérêt légitime de DataforiaSanté
- Les obligations légales applicables

Pour les données médicales (données sensibles), nous recueillons votre consentement explicite conformément à la loi sénégalaise n°2008-12 sur la protection des données personnelles.`
          },
          {
            id: '5',
            titre: '5. Durée de conservation',
            icon: '🕐',
            contenu: `Vos données sont conservées pendant :

- Données de compte : durée de vie du compte + 3 ans
- Dossier médical : 10 ans (obligation légale médicale)
- Données de navigation : 13 mois maximum
- Logs de connexion : 12 mois

Après ces délais, vos données sont supprimées ou anonymisées.`
          },
          {
            id: '6',
            titre: '6. Partage des données',
            icon: '🤝',
            contenu: `Nous ne vendons jamais vos données personnelles.

Vos données peuvent être partagées avec :

- Les professionnels de santé que vous consultez (médecins, pharmaciens)
- Nos prestataires techniques (Supabase pour l'hébergement, Anthropic pour l'IA)
- Les autorités compétentes si la loi l'exige

Tous nos prestataires sont soumis à des obligations contractuelles strictes de confidentialité.

DataforiaSanté ne partage pas vos données avec des tiers à des fins commerciales.`
          },
          {
            id: '7',
            titre: '7. Vos droits',
            icon: '✅',
            contenu: `Conformément à la loi sénégalaise sur la protection des données personnelles, vous disposez des droits suivants :

- Droit d'accès : obtenir une copie de vos données
- Droit de rectification : corriger vos données inexactes
- Droit à l'effacement : demander la suppression de vos données
- Droit d'opposition : vous opposer au traitement
- Droit à la portabilité : recevoir vos données dans un format lisible
- Droit de retirer votre consentement à tout moment

Pour exercer ces droits, contactez-nous à :
contact@dataforiasante.sn

Vous pouvez également déposer une plainte auprès de la Commission des Données Personnelles (CDP) du Sénégal.`
          },
          {
            id: '8',
            titre: '8. Sécurité des données',
            icon: '🔒',
            contenu: `Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :

- Chiffrement des données en transit (HTTPS/TLS)
- Contrôle d'accès strict (Row Level Security)
- Authentification sécurisée via Supabase Auth
- Accès aux dossiers médicaux limité aux professionnels de santé autorisés
- Hébergement sécurisé sur des serveurs certifiés
- Sauvegardes régulières
- Surveillance des accès et des anomalies

En cas de violation de données, nous vous notifierons dans les 72 heures conformément à la réglementation applicable.`
          },
          {
            id: '9',
            titre: '9. Cookies',
            icon: '🍪',
            contenu: `DataforiaSanté utilise des cookies pour :

Cookies essentiels (obligatoires) :
- Maintenir votre session de connexion
- Assurer la sécurité de la plateforme
- Mémoriser vos préférences

Cookies analytiques (avec votre consentement) :
- Mesurer l'audience du site
- Améliorer l'expérience utilisateur

Vous pouvez gérer vos préférences de cookies à tout moment via notre bannière de consentement.`
          },
          {
            id: '10',
            titre: '10. Contact',
            icon: '📧',
            contenu: `Pour toute question relative à la protection de vos données personnelles :

- Email : contact@dataforiasante.sn
- Adresse : Dakar, Sénégal

Commission des Données Personnelles (CDP) du Sénégal :
- Site web : www.cdp.sn
- Téléphone : +221 33 889 29 29
- Adresse : Immeuble Thiaw Lèye, Sacré-Cœur 3, Dakar`
          }
        ].map(section => (
          <div key={section.id} id={`section-${section.id}`}
            style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {section.icon} {section.titre}
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {section.contenu}
            </div>
          </div>
        ))}

        {/* Footer légal */}
        <div style={{ background: 'var(--green-pale)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-3)', lineHeight: 1.6 }}>
            Cette politique de confidentialité est conforme à la loi sénégalaise n°2008-12 du 25 janvier 2008 portant sur la protection des données à caractère personnel.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: 600 }}>← Retour à l'accueil</Link>
            <Link to="/conditions" style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: 600 }}>Conditions d'utilisation →</Link>
          </div>
        </div>
      </main>

      <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,0.5)', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.82rem', marginTop: '2rem' }}>
        © 2024 DataforiaSanté · Sénégal 🇸🇳 · <Link to="/politique-confidentialite" style={{ color: 'rgba(255,255,255,0.5)' }}>Politique de confidentialité</Link>
      </footer>
    </div>
  );
}