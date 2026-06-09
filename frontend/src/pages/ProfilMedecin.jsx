import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMedecin, creerRdv, getAvis } from '../services/api';

export default function ProfilMedecin() {
  const { id } = useParams();
  const [medecin, setMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState('infos');
  const [modalRdv, setModalRdv] = useState(false);
  const [form, setForm] = useState({ prenom:'', nom:'', tel:'', email:'', creneau:'', motif:'' });
  const [confirmation, setConfirmation] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [avis, setAvis] = useState([]);

  useEffect(() => { charger(); }, [id]);

  async function charger() {
    try {
      setLoading(true);
      const res = await getMedecin(id);
      setMedecin(res.data.data);
      const resAvis = await getAvis(id);
      setAvis(resAvis.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function confirmerRdv() {
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
        motif: form.motif
      });
      const rdv = res.data.data;
      setModalRdv(false);
      setForm({ prenom:'', nom:'', tel:'', email:'', creneau:'', motif:'' });
      window.location.href = `/paiement?montant=${medecin.prix}&medecin=${encodeURIComponent(medecin.nom)}&creneau=${encodeURIComponent(form.creneau)}&ref=${rdv.id}&type=consultation`;
    } catch (err) {
      alert('Erreur lors de la confirmation');
    } finally {
      setEnvoi(false);
    }
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--ink-3)', fontFamily:'var(--sans)' }}>Chargement...</div>;
  if (!medecin) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--red)', fontFamily:'var(--sans)' }}>Médecin non trouvé</div>;

  return (
    <div style={{ minHeight:'100vh', background:'var(--paper)', fontFamily:'var(--sans)' }}>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(255,255,255,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'1.5rem', padding:'0 2rem', height:'68px' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#006B3F,#008B50)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>🏥</div>
          <span style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700 }}>Dataforia<span style={{ color:'var(--green)' }}>Santé</span></span>
        </Link>
        <div style={{ fontSize:'0.82rem', color:'var(--ink-3)' }}>
          <Link to="/" style={{ color:'var(--ink-3)' }}>Accueil</Link> ›
          <Link to="/medecins" style={{ color:'var(--ink-3)', margin:'0 4px' }}>Médecins</Link> ›
          <strong>{medecin.nom}</strong>
        </div>
      </nav>

      {/* HERO PROFIL */}
      <section style={{ paddingTop:'68px', background:'linear-gradient(160deg,#0E1510,#1A3020)', padding:'68px 2rem 0' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'2.5rem 0 0' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'2rem', flexWrap:'wrap' }}>
            <div style={{ width:'100px', height:'100px', borderRadius:'20px', background:'rgba(255,255,255,0.12)', border:'2px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', flexShrink:0 }}>👨‍⚕️</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px', flexWrap:'wrap' }}>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(1.5rem,3vw,2rem)', color:'#fff', margin:0 }}>{medecin.nom}</h1>
                <span style={{ background:'#DCFCE7', color:'#166534', fontSize:'0.7rem', fontWeight:700, padding:'3px 10px', borderRadius:'8px' }}>✅ Vérifié</span>
              </div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.95rem', marginBottom:'8px' }}>{medecin.spec} · {medecin.ville}</div>
              <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
                {[
                  { val: medecin.note+'/5', label:'Note' },
                  { val: medecin.experience+'ans', label:'Expérience' },
                  { val: (medecin.consultations_total||0).toLocaleString('fr-FR'), label:'Consultations' },
                  { val: avis.length, label:'Avis' }
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:'1.3rem', color:'#FDEF42', fontWeight:700 }}>{s.val}</div>
                    <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', flexShrink:0 }}>
              <button onClick={() => setModalRdv(true)} style={{ background:'var(--green)', color:'#fff', border:'none', borderRadius:'10px', padding:'0.75rem 1.5rem', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', whiteSpace:'nowrap' }}>
                📅 Prendre RDV — {medecin.prix?.toLocaleString('fr-FR')} FCFA
              </button>
              {medecin.teleconsult && (
                <button style={{ background:'rgba(255,255,255,0.1)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:'10px', padding:'0.65rem 1.5rem', fontWeight:600, fontSize:'0.85rem', cursor:'pointer' }}>
                  💻 Téléconsultation — {(medecin.tarif_teleconsult||0).toLocaleString('fr-FR')} FCFA
                </button>
              )}
            </div>
          </div>

          {/* ONGLETS */}
          <div style={{ display:'flex', gap:'0', marginTop:'2rem', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
            {[
              { key:'infos', label:'Informations' },
              { key:'avis', label:`Avis (${avis.length})` },
              { key:'rdv', label:'Disponibilités' }
            ].map(o => (
              <button key={o.key} onClick={() => setOnglet(o.key)} style={{ padding:'0.75rem 1.5rem', border:'none', background:'transparent', color: onglet===o.key ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight: onglet===o.key ? 700 : 400, fontSize:'0.85rem', cursor:'pointer', borderBottom: onglet===o.key ? '2px solid var(--green)' : '2px solid transparent', fontFamily:'var(--sans)' }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <main style={{ maxWidth:'1000px', margin:'0 auto', padding:'2rem' }}>

        {confirmation && (
          <div style={{ background:'#F0FDF4', border:'1.5px solid #86EFAC', borderRadius:'14px', padding:'1.25rem 1.5rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'12px' }}>
            <span style={{ fontSize:'1.5rem' }}>✅</span>
            <div>
              <div style={{ fontWeight:700, color:'#166534' }}>Rendez-vous confirmé !</div>
              <div style={{ fontSize:'0.82rem', color:'#166534' }}>{confirmation.patient_prenom} {confirmation.patient_nom} · {medecin.nom} · {confirmation.creneau} · Réf: {confirmation.id}</div>
            </div>
            <button onClick={() => setConfirmation(null)} style={{ marginLeft:'auto', background:'none', border:'none', fontSize:'1.2rem', color:'#166534', cursor:'pointer' }}>✕</button>
          </div>
        )}

        {/* ONGLET INFORMATIONS */}
        {onglet === 'infos' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'1.5rem', alignItems:'start' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'16px', padding:'1.5rem' }}>
                <h3 style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', marginBottom:'0.85rem', color:'var(--ink)' }}>À propos</h3>
                <p style={{ color:'var(--ink-2)', fontSize:'0.875rem', lineHeight:1.7 }}>{medecin.biographie || 'Informations à venir.'}</p>
              </div>
              <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'16px', padding:'1.5rem' }}>
                <h3 style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', marginBottom:'1rem', color:'var(--ink)' }}>Formation & Diplômes</h3>
                <div style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'var(--green-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>🎓</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--ink)' }}>{medecin.formation}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--ink-3)', marginTop:'3px' }}>{medecin.universite}</div>
                  </div>
                </div>
              </div>
              <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'16px', padding:'1.5rem' }}>
                <h3 style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', marginBottom:'0.85rem', color:'var(--ink)' }}>Langues parlées</h3>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {(medecin.langues||[]).map(l => (
                    <span key={l} style={{ background:'var(--green-light)', color:'var(--green)', fontSize:'0.78rem', fontWeight:600, padding:'4px 12px', borderRadius:'20px' }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'1rem', position:'sticky', top:'84px' }}>
              <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'16px', padding:'1.25rem' }}>
                <h3 style={{ fontFamily:'var(--serif)', fontSize:'1rem', marginBottom:'1rem', color:'var(--ink)' }}>Informations pratiques</h3>
                {[
                  { icon:'📍', label:'Adresse', val: medecin.cabinet_adresse },
                  { icon:'📞', label:'Téléphone', val: medecin.cabinet_tel },
                  { icon:'💰', label:'Consultation', val: medecin.prix?.toLocaleString('fr-FR')+' FCFA' },
                  { icon:'💻', label:'Téléconsultation', val: medecin.teleconsult ? (medecin.tarif_teleconsult?.toLocaleString('fr-FR')+' FCFA') : 'Non disponible' },
                ].map(info => (
                  <div key={info.label} style={{ display:'flex', gap:'10px', padding:'8px 0', borderBottom:'1px solid var(--green-light)' }}>
                    <span style={{ fontSize:'1rem', flexShrink:0 }}>{info.icon}</span>
                    <div>
                      <div style={{ fontSize:'0.68rem', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{info.label}</div>
                      <div style={{ fontSize:'0.82rem', color:'var(--ink)', fontWeight:500, marginTop:'2px' }}>{info.val || 'Non renseigné'}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setModalRdv(true)} style={{ width:'100%', padding:'0.85rem', background:'linear-gradient(135deg,var(--green),var(--green-mid))', color:'#fff', border:'none', borderRadius:'12px', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', boxShadow:'0 4px 16px rgba(0,107,63,0.3)' }}>
                📅 Prendre rendez-vous
              </button>
            </div>
          </div>
        )}

        {/* ONGLET AVIS */}
        {onglet === 'avis' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'16px', padding:'1.5rem', display:'flex', alignItems:'center', gap:'2rem', flexWrap:'wrap' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:'3rem', fontWeight:700, color:'var(--green)', lineHeight:1 }}>{medecin.note}</div>
                <div style={{ color:'#F59E0B', fontSize:'1.25rem', margin:'4px 0' }}>{'★'.repeat(Math.floor(medecin.note))}{'☆'.repeat(5-Math.floor(medecin.note))}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--ink-3)' }}>{avis.length} avis vérifiés</div>
              </div>
              <div style={{ flex:1, minWidth:'200px' }}>
                {[['Ponctualité',4.8],['Écoute',4.9],['Compétence',4.9],['Accueil',4.7]].map(([label,val]) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                    <span style={{ fontSize:'0.78rem', color:'var(--ink-2)', minWidth:'90px' }}>{label}</span>
                    <div style={{ flex:1, height:'6px', background:'var(--green-light)', borderRadius:'3px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(val/5)*100}%`, background:'var(--green)', borderRadius:'3px' }} />
                    </div>
                    <span style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--green)', minWidth:'28px' }}>{val}</span>
                  </div>
                ))}
              </div>
              <Link to={`/avis?medecin_id=${medecin.id}&medecin_nom=${encodeURIComponent(medecin.nom)}`}
                style={{ background:'var(--green)', color:'#fff', padding:'0.75rem 1.5rem', borderRadius:'10px', fontWeight:600, fontSize:'0.85rem', textDecoration:'none' }}>
                ⭐ Donner mon avis
              </Link>
            </div>

            {avis.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', background:'#fff', border:'1.5px solid var(--border)', borderRadius:'16px' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>⭐</div>
                <p style={{ color:'var(--ink-3)' }}>Aucun avis pour l'instant</p>
                <Link to={`/avis?medecin_id=${medecin.id}&medecin_nom=${encodeURIComponent(medecin.nom)}`}
                  style={{ display:'inline-block', marginTop:'1rem', background:'var(--green)', color:'#fff', padding:'0.65rem 1.25rem', borderRadius:'9px', fontWeight:600, fontSize:'0.82rem', textDecoration:'none' }}>
                  Soyez le premier à donner un avis
                </Link>
              </div>
            ) : avis.map((a, i) => (
              <div key={i} style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'14px', padding:'1.25rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'0.75rem' }}>
                  <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,var(--green),var(--green-mid))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'0.85rem' }}>
                    {a.patient_prenom?.[0]}{a.patient_nom?.[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--ink)' }}>{a.patient_prenom} {a.patient_nom?.[0]}.</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--ink-3)' }}>
                      {new Date(a.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}
                      {a.verifie && <span style={{ background:'#DCFCE7', color:'#166534', fontSize:'0.62rem', fontWeight:700, padding:'1px 6px', borderRadius:'4px', marginLeft:'6px' }}>✅ Vérifié</span>}
                    </div>
                  </div>
                  <div style={{ color:'#F59E0B', fontSize:'1rem' }}>{'⭐'.repeat(a.note)}{'☆'.repeat(5-a.note)}</div>
                </div>
                {a.commentaire && <p style={{ fontSize:'0.875rem', color:'var(--ink-2)', lineHeight:1.6, margin:0 }}>{a.commentaire}</p>}
              </div>
            ))}
          </div>
        )}

        {/* ONGLET DISPONIBILITÉS */}
        {onglet === 'rdv' && (
          <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'16px', padding:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', color:'var(--ink)', marginBottom:'1.25rem' }}>Créneaux disponibles</h3>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'1.5rem' }}>
              {(medecin.slots||[]).map(s => (
                <button key={s} onClick={() => { setForm(f => ({...f, creneau:s})); setModalRdv(true); }}
                  style={{ padding:'0.65rem 1.25rem', background:'var(--green-pale)', border:'1.5px solid var(--border)', borderRadius:'10px', fontSize:'0.85rem', fontWeight:600, color:'var(--green)', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseOver={e => { e.target.style.background='var(--green)'; e.target.style.color='#fff'; }}
                  onMouseOut={e => { e.target.style.background='var(--green-pale)'; e.target.style.color='var(--green)'; }}>
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => setModalRdv(true)} style={{ width:'100%', padding:'0.85rem', background:'linear-gradient(135deg,var(--green),var(--green-mid))', color:'#fff', border:'none', borderRadius:'12px', fontWeight:700, fontSize:'0.95rem', cursor:'pointer' }}>
              📅 Confirmer un rendez-vous
            </button>
          </div>
        )}
      </main>

      {/* MODAL RDV */}
      {modalRdv && (
        <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
          onClick={e => e.target === e.currentTarget && setModalRdv(false)}>
          <div style={{ background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'460px', overflow:'hidden', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ background:'linear-gradient(135deg,#0E1510,#1A3020)', padding:'1.5rem', display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'46px', height:'46px', borderRadius:'12px', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>👨‍⚕️</div>
              <div>
                <div style={{ color:'#fff', fontFamily:'var(--serif)', fontSize:'1.05rem' }}>{medecin.nom}</div>
                <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.78rem' }}>{medecin.spec} · {medecin.prix?.toLocaleString('fr-FR')} FCFA</div>
              </div>
              <button onClick={() => setModalRdv(false)} style={{ marginLeft:'auto', background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:'32px', height:'32px', borderRadius:'50%', fontSize:'1rem', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'0.85rem' }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Choisissez un créneau *</div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {(medecin.slots||[]).map(s => (
                  <button key={s} onClick={() => setForm(f => ({...f, creneau:s}))}
                    style={{ padding:'6px 14px', borderRadius:'8px', fontSize:'0.8rem', fontWeight:600, border:'1.5px solid', borderColor:form.creneau===s?'var(--green)':'var(--border)', background:form.creneau===s?'var(--green)':'var(--green-pale)', color:form.creneau===s?'#fff':'var(--green)', cursor:'pointer' }}>{s}</button>
                ))}
              </div>
              {[
                { label:'Prénom *', key:'prenom', type:'text', placeholder:'Votre prénom' },
                { label:'Nom *', key:'nom', type:'text', placeholder:'Votre nom' },
                { label:'Téléphone *', key:'tel', type:'tel', placeholder:'+221 7X XXX XX XX' },
                { label:'Email', key:'email', type:'email', placeholder:'votre@email.com' },
                { label:'Motif', key:'motif', type:'text', placeholder:'Motif de consultation' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--ink-2)', display:'block', marginBottom:'4px' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(prev => ({...prev, [f.key]:e.target.value}))}
                    style={{ width:'100%', padding:'0.65rem 0.85rem', border:'1.5px solid var(--border)', borderRadius:'8px', fontSize:'0.875rem', color:'var(--ink)', background:'var(--green-pale)', outline:'none', fontFamily:'var(--sans)' }} />
                </div>
              ))}
              <button onClick={confirmerRdv} disabled={envoi} style={{ width:'100%', padding:'0.85rem', background:'linear-gradient(135deg,var(--green),var(--green-mid))', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', opacity:envoi?0.7:1, fontFamily:'var(--sans)' }}>
                {envoi ? 'Confirmation...' : '✅ Confirmer le rendez-vous'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}