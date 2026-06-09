import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getMedecins, creerRdv } from '../services/api';

export default function Teleconsultation() {
  const [etape, setEtape] = useState(1);
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [medecin, setMedecin] = useState(null);
  const [form, setForm] = useState({ prenom:'', nom:'', tel:'', email:'', creneau:'', motif:'', spec:'' });
  const [envoi, setEnvoi] = useState(false);

  const specialites = [
    { icon:'🩺', label:'Médecine générale', val:'Généraliste' },
    { icon:'🫀', label:'Cardiologie', val:'Cardiologue' },
    { icon:'👶', label:'Pédiatrie', val:'Pédiatre' },
    { icon:'🤰', label:'Gynécologie', val:'Gynécologue' },
    { icon:'🧬', label:'Dermatologie', val:'Dermatologue' },
    { icon:'🧠', label:'Neurologie', val:'Neurologue' }
  ];

  async function choisirSpec(spec) {
    setForm(f => ({ ...f, spec }));
    try {
      setLoading(true);
      const res = await getMedecins({ spec });
      const disponibles = res.data.data.filter(m => m.teleconsult);
      setMedecins(disponibles.length > 0 ? disponibles : res.data.data);
      setEtape(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function confirmer() {
    if (!form.prenom || !form.nom || !form.tel || !form.creneau) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      setEnvoi(true);
      const res = await creerRdv({
        medecin_id: medecin.id,
        medecin_nom: medecin.nom,
        specialite: medecin.spec,
        patient_prenom: form.prenom,
        patient_nom: form.nom,
        patient_tel: form.tel,
        patient_email: form.email,
        creneau: form.creneau,
        motif: `[TÉLÉCONSULTATION] ${form.motif}`
      });

      const rdv = res.data.data;
      const rdvId = rdv.id || `TELE-${Date.now()}`;
      const montant = medecin.tarif_teleconsult || medecin.prix || 10000;

      window.location.href = `/paiement?montant=${montant}&medecin=${encodeURIComponent(medecin.nom)}&creneau=${encodeURIComponent(form.creneau)}&ref=${rdvId}&type=teleconsultation`;

    } catch (err) {
      console.error('Erreur téléconsultation:', err);
      alert('Erreur lors de la confirmation');
    } finally {
      setEnvoi(false);
    }
  }

  const inputStyle = {
    width:'100%', padding:'0.75rem 0.9rem',
    border:'1.5px solid var(--border)', borderRadius:'10px',
    fontSize:'0.875rem', color:'var(--ink)',
    background:'var(--green-pale)', outline:'none', fontFamily:'var(--sans)'
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--paper)', fontFamily:'var(--sans)' }}>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(255,255,255,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'1.5rem', padding:'0 2rem', height:'68px' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#006B3F,#008B50)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>🏥</div>
          <span style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700 }}>Dataforia<span style={{ color:'var(--green)' }}>Santé</span></span>
        </Link>
        <div style={{ fontSize:'0.82rem', color:'var(--ink-3)' }}>
          <Link to="/" style={{ color:'var(--ink-3)' }}>Accueil</Link> › <strong>Téléconsultation</strong>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:'0.75rem' }}>
          <Link to="/medecins" style={{ fontSize:'0.82rem', color:'var(--ink-2)' }}>🩺 Médecins</Link>
          <Link to="/pharmacies" style={{ fontSize:'0.82rem', color:'var(--ink-2)' }}>💊 Pharmacies</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background:'linear-gradient(160deg,#1E1B4B,#312E81,#4338CA)', padding:'100px 2rem 3rem' }}>
        <div style={{ maxWidth:'700px', margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>💻</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(1.8rem,3vw,2.5rem)', color:'#fff', marginBottom:'0.75rem' }}>
            Téléconsultation <em style={{ color:'#FDEF42' }}>en ligne</em>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.9rem', lineHeight:1.6, marginBottom:'2rem' }}>
            Consultez un médecin en vidéo depuis chez vous · Disponible en français et en wolof · Ordonnance envoyée par SMS
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:'2rem', flexWrap:'wrap' }}>
            {[
              { val:'15 min', label:'Délai moyen' },
              { val:'100%', label:'Sécurisé' },
              { val:'24h/24', label:'Disponible' }
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily:'var(--serif)', fontSize:'1.6rem', color:'#FDEF42', fontWeight:700 }}>{s.val}</div>
                <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Indicateur étapes */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginTop:'2rem' }}>
            {[
              { num:1, label:'Spécialité' },
              { num:2, label:'Médecin' },
              { num:3, label:'Confirmation' }
            ].map((e, i) => (
              <div key={e.num} style={{ display:'flex', alignItems:'center' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.82rem', fontWeight:700, background: etape >= e.num ? '#fff' : 'rgba(255,255,255,0.2)', color: etape >= e.num ? '#4338CA' : 'rgba(255,255,255,0.6)' }}>
                    {etape > e.num ? '✓' : e.num}
                  </div>
                  <span style={{ fontSize:'0.62rem', color: etape >= e.num ? '#fff' : 'rgba(255,255,255,0.4)' }}>{e.label}</span>
                </div>
                {i < 2 && <div style={{ width:'60px', height:'2px', background: etape > e.num ? '#fff' : 'rgba(255,255,255,0.2)', margin:'0 4px 20px' }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <main style={{ maxWidth:'800px', margin:'0 auto', padding:'2rem' }}>

        {/* ÉTAPE 1 — SPÉCIALITÉ */}
        {etape === 1 && (
          <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'20px', padding:'2rem' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'1.2rem', color:'var(--ink)', marginBottom:'0.5rem' }}>Quelle spécialité ?</h2>
            <p style={{ fontSize:'0.82rem', color:'var(--ink-3)', marginBottom:'1.5rem' }}>Choisissez le type de médecin que vous souhaitez consulter.</p>
            {loading && <div style={{ textAlign:'center', padding:'2rem', color:'var(--ink-3)' }}>Chargement...</div>}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'10px' }}>
              {specialites.map(s => (
                <div key={s.val} onClick={() => choisirSpec(s.val)}
                  style={{ padding:'1.25rem', border:'1.5px solid var(--border)', borderRadius:'14px', cursor:'pointer', textAlign:'center', transition:'all 0.2s', background:'#fff' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='#4338CA'; e.currentTarget.style.background='#EDE9FE'; e.currentTarget.style.transform='translateY(-3px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='#fff'; e.currentTarget.style.transform='none'; }}>
                  <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{s.icon}</div>
                  <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--ink)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — CHOISIR MÉDECIN */}
        {etape === 2 && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.25rem' }}>
              <button onClick={() => setEtape(1)} style={{ background:'none', border:'1.5px solid var(--border)', borderRadius:'8px', padding:'6px 12px', fontSize:'0.78rem', color:'var(--ink-2)', cursor:'pointer', fontFamily:'var(--sans)' }}>← Retour</button>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', color:'var(--ink)', margin:0 }}>Médecins disponibles</h2>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {medecins.map(m => (
                <div key={m.id} onClick={() => { setMedecin(m); setEtape(3); }}
                  style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'16px', padding:'1.25rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', transition:'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='#4338CA'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(67,56,202,0.1)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                  <div style={{ width:'50px', height:'50px', borderRadius:'12px', background:'linear-gradient(135deg,#4338CA,#6D28D9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>👨‍⚕️</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--ink)' }}>{m.nom}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--ink-3)', marginTop:'2px' }}>{m.spec} · {m.ville}</div>
                    <div style={{ display:'flex', gap:'8px', marginTop:'6px', flexWrap:'wrap' }}>
                      {(m.slots||[]).slice(0,3).map(s => (
                        <span key={s} style={{ background:'#EDE9FE', color:'#4338CA', fontSize:'0.7rem', fontWeight:600, padding:'2px 8px', borderRadius:'6px' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:'1rem', fontWeight:700, color:'#4338CA' }}>
                      {(m.tarif_teleconsult || m.prix).toLocaleString('fr-FR')} FCFA
                    </div>
                    <div style={{ fontSize:'0.7rem', color:'var(--ink-3)', marginTop:'2px' }}>💻 Vidéo</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--green)', fontWeight:500, marginTop:'2px' }}>⭐ {m.note}/5</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — FORMULAIRE */}
        {etape === 3 && medecin && (
          <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'20px', padding:'2rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.5rem' }}>
              <button onClick={() => setEtape(2)} style={{ background:'none', border:'1.5px solid var(--border)', borderRadius:'8px', padding:'6px 12px', fontSize:'0.78rem', color:'var(--ink-2)', cursor:'pointer', fontFamily:'var(--sans)' }}>← Retour</button>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', color:'var(--ink)', margin:0 }}>Confirmer la téléconsultation</h2>
            </div>

            {/* Info médecin */}
            <div style={{ background:'linear-gradient(135deg,#EDE9FE,#DDD6FE)', border:'1px solid #C4B5FD', borderRadius:'12px', padding:'1rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'linear-gradient(135deg,#4338CA,#6D28D9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>👨‍⚕️</div>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.875rem', color:'#1E1B4B' }}>{medecin.nom}</div>
                <div style={{ fontSize:'0.75rem', color:'#4338CA' }}>{medecin.spec} · 💻 Téléconsultation</div>
              </div>
              <div style={{ marginLeft:'auto', fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700, color:'#4338CA' }}>
                {(medecin.tarif_teleconsult || medecin.prix).toLocaleString('fr-FR')} FCFA
              </div>
            </div>

            {/* Créneaux */}
            <div style={{ marginBottom:'1.25rem' }}>
              <label style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--ink-2)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px' }}>Créneau *</label>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {(medecin.slots||[]).map(s => (
                  <button key={s} onClick={() => setForm(f => ({ ...f, creneau:s }))}
                    style={{ padding:'8px 16px', borderRadius:'8px', fontSize:'0.82rem', fontWeight:600, border:'1.5px solid', borderColor:form.creneau===s?'#4338CA':'var(--border)', background:form.creneau===s?'#4338CA':'#EDE9FE', color:form.creneau===s?'#fff':'#4338CA', cursor:'pointer', fontFamily:'var(--sans)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Champs patient */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'1.25rem' }}>
              {[
                { label:'Prénom *', key:'prenom', type:'text', placeholder:'Votre prénom' },
                { label:'Nom *', key:'nom', type:'text', placeholder:'Votre nom' },
                { label:'Téléphone *', key:'tel', type:'tel', placeholder:'+221 7X XXX XX XX' },
                { label:'Email', key:'email', type:'email', placeholder:'votre@email.com' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--ink-2)', display:'block', marginBottom:'5px' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]:e.target.value }))}
                    style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--ink-2)', display:'block', marginBottom:'5px' }}>Motif de consultation</label>
                <textarea value={form.motif} onChange={e => setForm(f => ({ ...f, motif:e.target.value }))}
                  placeholder="Décrivez brièvement vos symptômes..."
                  rows={3} style={{ ...inputStyle, resize:'none', lineHeight:1.6 }} />
              </div>
            </div>

            <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:'10px', padding:'0.85rem 1rem', marginBottom:'1.25rem', fontSize:'0.78rem', color:'#92400E' }}>
              ℹ️ Un lien de consultation vidéo vous sera envoyé après confirmation du paiement.
            </div>

            <button onClick={confirmer} disabled={envoi} style={{ width:'100%', padding:'0.9rem', background:'linear-gradient(135deg,#4338CA,#6D28D9)', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', opacity:envoi?0.7:1, fontFamily:'var(--sans)', boxShadow:'0 4px 16px rgba(67,56,202,0.3)' }}>
              {envoi ? 'Création du RDV...' : '💳 Continuer vers le paiement'}
            </button>
          </div>
        )}
      </main>

      <footer style={{ background:'var(--ink)', color:'rgba(255,255,255,0.5)', padding:'2rem 3rem', textAlign:'center', fontSize:'0.82rem', marginTop:'4rem' }}>
        © 2024 DataforiaSanté · Sénégal 🇸🇳
      </footer>
    </div>
  );
}