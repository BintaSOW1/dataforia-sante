import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDossierComplet, creerDossier, ajouterConstantes, ajouterVaccination } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import supabase from '../supabase';

function GraphiquesConstantes({ constantes }) {
  const data = [...constantes].reverse().map(c => ({
    date: new Date(c.date_mesure).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    tension: c.tension ? parseInt(c.tension.split('/')[0]) : null,
    poids: c.poids ? parseFloat(c.poids) : null,
    glycemie: c.glycemie ? parseFloat(c.glycemie) : null,
    temperature: c.temperature ? parseFloat(c.temperature) : null,
    pouls: c.pouls ? parseInt(c.pouls) : null
  }));

  if (data.length < 2) return null;

  const hasTension = data.some(d => d.tension);
  const hasPoids = data.some(d => d.poids);
  const hasGlycemie = data.some(d => d.glycemie);
  const hasPouls = data.some(d => d.pouls);

  const chartStyle = {
    background: '#fff',
    border: '1.5px solid var(--border)',
    borderRadius: '16px',
    padding: '1.25rem'
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', color: 'var(--ink)', marginBottom: '1.25rem' }}>
        📈 Évolution des constantes
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {hasTension && (
          <div style={chartStyle}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', marginBottom: '0.75rem' }}>🫀 Tension artérielle (mmHg)</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ fontSize: '0.75rem', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="tension" stroke="#DC2626" strokeWidth={2} dot={{ fill: '#DC2626', r: 3 }} name="Systolique" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {hasPoids && (
          <div style={chartStyle}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369A1', marginBottom: '0.75rem' }}>⚖️ Poids (kg)</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ fontSize: '0.75rem', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="poids" stroke="#0369A1" strokeWidth={2} dot={{ fill: '#0369A1', r: 3 }} name="Poids (kg)" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {hasGlycemie && (
          <div style={chartStyle}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', marginBottom: '0.75rem' }}>🩸 Glycémie (g/L)</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ fontSize: '0.75rem', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="glycemie" stroke="#D97706" strokeWidth={2} dot={{ fill: '#D97706', r: 3 }} name="Glycémie (g/L)" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {hasPouls && (
          <div style={chartStyle}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED', marginBottom: '0.75rem' }}>💓 Pouls (bpm)</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ fontSize: '0.75rem', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="pouls" stroke="#7C3AED" strokeWidth={2} dot={{ fill: '#7C3AED', r: 3 }} name="Pouls (bpm)" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DossierMedical() {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState('resume');
  const [user, setUser] = useState(null);
  const [tel, setTel] = useState('');
  const [recherche, setRecherche] = useState('');
  const [searchParams] = useSearchParams();
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dossierSelectionne, setDossierSelectionne] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const [formConsult, setFormConsult] = useState({ patient_prenom:'', patient_nom:'', patient_tel:'', medecin_nom:'', motif:'', diagnostic:'', ordonnance:'', notes:'', allergies:'', antecedents:'', traitements_en_cours:'', groupe_sanguin:'', taille:'', poids:'', medecin_traitant:'' });
  const [formConstantes, setFormConstantes] = useState({ patient_tel:'', tension:'', poids:'', glycemie:'', temperature:'', pouls:'' });
  const [formVaccin, setFormVaccin] = useState({ patient_tel:'', vaccin:'', date_vaccination:'', prochain_rappel:'', medecin_nom:'' });

  useEffect(() => { init(); }, []);

  async function init() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const telUrl = searchParams.get('tel');
      if (telUrl) { setTel(telUrl); charger(telUrl); return; }
      if (user) {
        const { data: profil } = await supabase.from('profils').select('*').eq('id', user.id).single();
        if (profil?.tel) { setTel(profil.tel); charger(profil.tel); }
        else setLoading(false);
      } else setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  }

  async function charger(telephone) {
    try {
      setLoading(true);
      const res = await getDossierComplet(telephone);
      setDossier(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function exporterPDF() {
    const element = document.getElementById('dossier-pdf');
    if (!element) { alert('Allez sur l\'onglet Résumé pour exporter le PDF'); return; }
    try {
      setExportLoading(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`dossier-${patient?.prenom || 'patient'}-${patient?.nom || ''}-${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);
    } catch (err) {
      console.error('Erreur export PDF:', err);
      alert('Erreur lors de l\'export PDF');
    } finally {
      setExportLoading(false);
    }
  }

  async function sauvegarderConsult() {
    if (!formConsult.patient_prenom || !formConsult.patient_nom || !formConsult.patient_tel) { alert('Remplissez les champs obligatoires'); return; }
    try {
      setSaving(true);
      await creerDossier({ ...formConsult, taille: formConsult.taille ? parseInt(formConsult.taille) : null, poids: formConsult.poids ? parseFloat(formConsult.poids) : null });
      charger(formConsult.patient_tel || tel);
      setModal(null);
      setFormConsult({ patient_prenom:'', patient_nom:'', patient_tel:'', medecin_nom:'', motif:'', diagnostic:'', ordonnance:'', notes:'', allergies:'', antecedents:'', traitements_en_cours:'', groupe_sanguin:'', taille:'', poids:'', medecin_traitant:'' });
    } catch (err) { alert('Erreur'); } finally { setSaving(false); }
  }

  async function sauvegarderConstantes() {
    try {
      setSaving(true);
      await ajouterConstantes({ ...formConstantes, patient_tel: tel });
      charger(tel);
      setModal(null);
      setFormConstantes({ patient_tel:'', tension:'', poids:'', glycemie:'', temperature:'', pouls:'' });
    } catch (err) { alert('Erreur'); } finally { setSaving(false); }
  }

  async function sauvegarderVaccin() {
    try {
      setSaving(true);
      await ajouterVaccination({ ...formVaccin, patient_tel: tel });
      charger(tel);
      setModal(null);
      setFormVaccin({ patient_tel:'', vaccin:'', date_vaccination:'', prochain_rappel:'', medecin_nom:'' });
    } catch (err) { alert('Erreur'); } finally { setSaving(false); }
  }

  const inp = { width:'100%', padding:'0.7rem 0.85rem', border:'1.5px solid var(--border)', borderRadius:'9px', fontSize:'0.85rem', color:'var(--ink)', background:'var(--green-pale)', outline:'none', fontFamily:'var(--sans)' };
  const ta = { ...inp, resize:'none', lineHeight:1.6 };
  const groupeSanguinColors = { 'A+':'#DCFCE7','A-':'#FEE2E2','B+':'#DBEAFE','B-':'#EDE9FE','AB+':'#FEF3C7','AB-':'#FCE7F3','O+':'#D1FAE5','O-':'#FEE2E2' };

  const onglets = [
    { key:'resume', icon:'🏠', label:'Résumé' },
    { key:'consultations', icon:'🩺', label:'Consultations' },
    { key:'ordonnances', icon:'💊', label:'Ordonnances' },
    { key:'constantes', icon:'📊', label:'Constantes' },
    { key:'vaccinations', icon:'💉', label:'Vaccinations' },
    { key:'documents', icon:'📄', label:'Documents' }
  ];

  const patient = dossier?.patient;
  const consultations = dossier?.consultations || [];
  const constantes = dossier?.constantes || [];
  const vaccinations = dossier?.vaccinations || [];
  const dernieresConstantes = constantes[0];

  return (
    <div style={{ minHeight:'100vh', background:'var(--paper)', fontFamily:'var(--sans)' }}>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(255,255,255,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'1.5rem', padding:'0 2rem', height:'68px' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'9px', background:'linear-gradient(135deg,#006B3F,#008B50)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.95rem' }}>🏥</div>
          <span style={{ fontFamily:'var(--serif)', fontSize:'1.05rem', fontWeight:700 }}>Dataforia<span style={{ color:'var(--green)' }}>Santé</span></span>
        </Link>
        <div style={{ fontSize:'0.78rem', color:'var(--ink-3)' }}>
          <Link to="/" style={{ color:'var(--ink-3)' }}>Accueil</Link>
          {user && <><span style={{ margin:'0 4px' }}>›</span><Link to="/espace-medecin" style={{ color:'var(--ink-3)' }}>Espace médecin</Link></>}
          <span style={{ margin:'0 4px' }}>›</span><strong>Dossier médical</strong>
          {tel && <span style={{ color:'var(--green)', marginLeft:'4px' }}>— {tel}</span>}
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center' }}>
          {patient && (
            <button onClick={exporterPDF} disabled={exportLoading}
              style={{ background:'var(--green)', color:'#fff', border:'none', borderRadius:'8px', padding:'0.45rem 1rem', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'var(--sans)', opacity: exportLoading ? 0.7 : 1, display:'flex', alignItems:'center', gap:'6px' }}>
              {exportLoading ? '⏳ Export...' : '📄 Export PDF'}
            </button>
          )}
          {user ? <Link to="/espace-medecin" style={{ fontSize:'0.82rem', color:'var(--green)', fontWeight:600 }}>Mon espace</Link>
          : <Link to="/connexion" style={{ background:'var(--green)', color:'#fff', padding:'0.45rem 1rem', borderRadius:'8px', fontSize:'0.82rem', fontWeight:600 }}>Connexion</Link>}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background:'linear-gradient(160deg,#0E1510,#1A3020)', padding:'80px 2rem 0' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>

          {!tel && (
            <div style={{ paddingTop:'2rem', paddingBottom:'3rem' }}>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:'2rem', color:'#fff', marginBottom:'1rem' }}>Dossier <em style={{ color:'#FDEF42' }}>Médical</em></h1>
              <div style={{ display:'flex', gap:'10px', maxWidth:'500px' }}>
                <input value={recherche} onChange={e => setRecherche(e.target.value)} onKeyDown={e => e.key==='Enter' && (setTel(recherche), charger(recherche))}
                  placeholder="Numéro de téléphone du patient..." style={{ flex:1, padding:'0.75rem 1rem', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'10px', color:'#fff', fontSize:'0.875rem', outline:'none' }} />
                <button onClick={() => { setTel(recherche); charger(recherche); }} style={{ background:'var(--green)', color:'#fff', border:'none', padding:'0.75rem 1.5rem', borderRadius:'10px', fontWeight:600, cursor:'pointer', fontFamily:'var(--sans)' }}>🔍</button>
              </div>
            </div>
          )}

          {tel && patient && (
            <div style={{ paddingTop:'2rem', display:'flex', alignItems:'flex-start', gap:'2rem', flexWrap:'wrap' }}>
              <div style={{ width:'72px', height:'72px', borderRadius:'18px', background:'linear-gradient(135deg,var(--green),var(--green-mid))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'1.6rem', flexShrink:0 }}>
                {patient.prenom?.[0]}{patient.nom?.[0]}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px', flexWrap:'wrap' }}>
                  <h1 style={{ fontFamily:'var(--serif)', fontSize:'1.75rem', color:'#fff', margin:0 }}>{patient.prenom} {patient.nom}</h1>
                  {patient.groupe_sanguin && <span style={{ background: groupeSanguinColors[patient.groupe_sanguin]||'#fff', color:'#111', fontSize:'0.72rem', fontWeight:700, padding:'3px 10px', borderRadius:'8px' }}>{patient.groupe_sanguin}</span>}
                </div>
                <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', marginBottom:'6px' }}>
                  <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem' }}>📞 {patient.tel}</span>
                  {patient.date_naissance && <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem' }}>🎂 {new Date(patient.date_naissance).toLocaleDateString('fr-FR')}</span>}
                  {patient.taille && <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem' }}>📏 {patient.taille} cm</span>}
                  {patient.poids && <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem' }}>⚖️ {patient.poids} kg</span>}
                  {patient.medecin_traitant && <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem' }}>👨‍⚕️ {patient.medecin_traitant}</span>}
                </div>
                {patient.allergies && <div style={{ background:'rgba(220,38,38,0.2)', border:'1px solid rgba(220,38,38,0.4)', borderRadius:'8px', padding:'5px 12px', fontSize:'0.75rem', color:'#FCA5A5', display:'inline-block' }}>⚠️ Allergies : {patient.allergies}</div>}
              </div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                <button onClick={() => setModal('consultation')} style={{ background:'var(--green)', color:'#fff', border:'none', borderRadius:'9px', padding:'0.6rem 1.1rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', fontFamily:'var(--sans)' }}>+ Consultation</button>
                <button onClick={() => setModal('constantes')} style={{ background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'9px', padding:'0.6rem 1.1rem', fontSize:'0.8rem', cursor:'pointer', fontFamily:'var(--sans)' }}>📊 Constantes</button>
                <button onClick={() => setModal('vaccin')} style={{ background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'9px', padding:'0.6rem 1.1rem', fontSize:'0.8rem', cursor:'pointer', fontFamily:'var(--sans)' }}>💉 Vaccin</button>
                <button onClick={exporterPDF} disabled={exportLoading} style={{ background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'9px', padding:'0.6rem 1.1rem', fontSize:'0.8rem', cursor:'pointer', fontFamily:'var(--sans)', opacity: exportLoading ? 0.7 : 1 }}>
                  {exportLoading ? '⏳...' : '📄 PDF'}
                </button>
              </div>
            </div>
          )}

          {tel && !patient && !loading && (
            <div style={{ paddingTop:'2rem', paddingBottom:'1rem' }}>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:'1.75rem', color:'#fff', marginBottom:'0.5rem' }}>Nouveau patient</h1>
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.9rem' }}>Aucun dossier existant pour ce numéro. Créez la première consultation.</p>
              <button onClick={() => setModal('consultation')} style={{ marginTop:'1rem', background:'var(--green)', color:'#fff', border:'none', borderRadius:'9px', padding:'0.7rem 1.5rem', fontSize:'0.85rem', fontWeight:600, cursor:'pointer', fontFamily:'var(--sans)' }}>+ Créer le dossier</button>
            </div>
          )}

          {tel && (
            <div style={{ display:'flex', gap:'0', marginTop:'1.5rem', overflowX:'auto', scrollbarWidth:'none' }}>
              {onglets.map(o => (
                <button key={o.key} onClick={() => setOnglet(o.key)}
                  style={{ padding:'0.75rem 1.25rem', border:'none', background:'transparent', color: onglet===o.key ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight: onglet===o.key ? 700 : 400, fontSize:'0.82rem', cursor:'pointer', borderBottom: onglet===o.key ? '2px solid var(--green)' : '2px solid transparent', fontFamily:'var(--sans)', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'5px' }}>
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <main style={{ maxWidth:'1100px', margin:'0 auto', padding:'2rem' }}>
        {loading && <div style={{ textAlign:'center', padding:'4rem', color:'var(--ink-3)' }}>Chargement du dossier...</div>}

        {/* ── RÉSUMÉ ── */}
        {!loading && tel && onglet === 'resume' && (
          <div id="dossier-pdf" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>

            <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'16px', padding:'1.5rem' }}>
              <h3 style={{ fontFamily:'var(--serif)', fontSize:'1.05rem', color:'var(--ink)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'8px' }}>🧑 Informations personnelles</h3>
              {patient ? [
                { label:'Nom complet', val:`${patient.prenom} ${patient.nom}` },
                { label:'Téléphone', val:patient.tel },
                { label:'Date de naissance', val:patient.date_naissance ? new Date(patient.date_naissance).toLocaleDateString('fr-FR') : '—' },
                { label:'Groupe sanguin', val:patient.groupe_sanguin || '—' },
                { label:'Taille', val:patient.taille ? patient.taille+' cm' : '—' },
                { label:'Poids', val:patient.poids ? patient.poids+' kg' : '—' },
                { label:'Médecin traitant', val:patient.medecin_traitant || '—' }
              ].map(f => (
                <div key={f.label} style={{ display:'flex', gap:'10px', padding:'6px 0', borderBottom:'1px solid var(--green-light)', fontSize:'0.82rem' }}>
                  <span style={{ color:'var(--ink-3)', minWidth:'130px' }}>{f.label}</span>
                  <span style={{ color:'var(--ink)', fontWeight:500 }}>{f.val}</span>
                </div>
              )) : <p style={{ color:'var(--ink-3)', fontSize:'0.875rem' }}>Aucune donnée disponible</p>}
            </div>

            <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'16px', padding:'1.5rem' }}>
              <h3 style={{ fontFamily:'var(--serif)', fontSize:'1.05rem', color:'var(--ink)', marginBottom:'1rem' }}>📊 Dernières constantes</h3>
              {dernieresConstantes ? (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  {[
                    { icon:'🫀', label:'Tension', val:dernieresConstantes.tension, unit:'mmHg', color:'#DC2626' },
                    { icon:'⚖️', label:'Poids', val:dernieresConstantes.poids, unit:'kg', color:'#0369A1' },
                    { icon:'🩸', label:'Glycémie', val:dernieresConstantes.glycemie, unit:'g/L', color:'#D97706' },
                    { icon:'🌡️', label:'Température', val:dernieresConstantes.temperature, unit:'°C', color:'#7C3AED' },
                    { icon:'💓', label:'Pouls', val:dernieresConstantes.pouls, unit:'bpm', color:'#DC2626' }
                  ].filter(c => c.val).map(c => (
                    <div key={c.label} style={{ background:'var(--green-pale)', borderRadius:'10px', padding:'0.85rem', textAlign:'center' }}>
                      <div style={{ fontSize:'1.3rem', marginBottom:'3px' }}>{c.icon}</div>
                      <div style={{ fontFamily:'var(--serif)', fontSize:'1.2rem', fontWeight:700, color:c.color }}>{c.val}<span style={{ fontSize:'0.65rem', color:'var(--ink-3)', marginLeft:'2px' }}>{c.unit}</span></div>
                      <div style={{ fontSize:'0.65rem', color:'var(--ink-3)', marginTop:'2px' }}>{c.label}</div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ textAlign:'center', padding:'1.5rem', color:'var(--ink-3)', fontSize:'0.875rem' }}>📊 Aucune constante enregistrée<br/><button onClick={() => setModal('constantes')} style={{ marginTop:'8px', background:'var(--green)', color:'#fff', border:'none', borderRadius:'8px', padding:'5px 14px', fontSize:'0.75rem', cursor:'pointer', fontFamily:'var(--sans)' }}>+ Ajouter</button></div>}
              {dernieresConstantes && <div style={{ fontSize:'0.68rem', color:'var(--ink-3)', marginTop:'8px', textAlign:'right' }}>Mesure du {new Date(dernieresConstantes.date_mesure).toLocaleDateString('fr-FR')}</div>}
            </div>

            <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'16px', padding:'1.5rem' }}>
              <h3 style={{ fontFamily:'var(--serif)', fontSize:'1.05rem', color:'var(--ink)', marginBottom:'1rem' }}>⚠️ Allergies & Antécédents</h3>
              <div style={{ marginBottom:'1rem' }}>
                <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px' }}>Allergies</div>
                {patient?.allergies ? <div style={{ background:'#FEE2E2', color:'#DC2626', padding:'8px 12px', borderRadius:'8px', fontSize:'0.82rem', lineHeight:1.6 }}>{patient.allergies}</div>
                : <div style={{ color:'var(--ink-3)', fontSize:'0.82rem' }}>Aucune allergie connue ✅</div>}
              </div>
              <div style={{ marginBottom:'1rem' }}>
                <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px' }}>Antécédents médicaux</div>
                {patient?.antecedents ? <div style={{ background:'var(--green-pale)', padding:'8px 12px', borderRadius:'8px', fontSize:'0.82rem', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{patient.antecedents}</div>
                : <div style={{ color:'var(--ink-3)', fontSize:'0.82rem' }}>Aucun antécédent renseigné</div>}
              </div>
              <div>
                <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px' }}>Traitements en cours</div>
                {patient?.traitements_en_cours ? <div style={{ background:'#DBEAFE', padding:'8px 12px', borderRadius:'8px', fontSize:'0.82rem', lineHeight:1.6, color:'#1D4ED8', whiteSpace:'pre-wrap' }}>{patient.traitements_en_cours}</div>
                : <div style={{ color:'var(--ink-3)', fontSize:'0.82rem' }}>Aucun traitement en cours</div>}
              </div>
            </div>

            <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'16px', padding:'1.5rem' }}>
              <h3 style={{ fontFamily:'var(--serif)', fontSize:'1.05rem', color:'var(--ink)', marginBottom:'1rem' }}>📈 Statistiques</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {[
                  { icon:'🩺', label:'Consultations', val:consultations.length, color:'#006B3F' },
                  { icon:'💊', label:'Ordonnances', val:consultations.filter(c => c.ordonnance).length, color:'#0369A1' },
                  { icon:'📊', label:'Constantes', val:constantes.length, color:'#7C3AED' },
                  { icon:'💉', label:'Vaccinations', val:vaccinations.length, color:'#D97706' }
                ].map(s => (
                  <div key={s.label} style={{ background:'var(--green-pale)', borderRadius:'12px', padding:'1rem', textAlign:'center', borderLeft:`3px solid ${s.color}` }}>
                    <div style={{ fontSize:'1.3rem', marginBottom:'3px' }}>{s.icon}</div>
                    <div style={{ fontFamily:'var(--serif)', fontSize:'1.5rem', fontWeight:700, color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:'0.68rem', color:'var(--ink-3)', marginTop:'2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {consultations.length > 0 && (
                <div style={{ marginTop:'1rem', padding:'0.75rem', background:'var(--green-pale)', borderRadius:'10px', fontSize:'0.78rem', color:'var(--ink-2)' }}>
                  Dernière consultation : <strong>{new Date(consultations[0].created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}</strong>
                  {consultations[0].medecin_nom && <> avec {consultations[0].medecin_nom}</>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CONSULTATIONS ── */}
        {!loading && tel && onglet === 'consultations' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <div style={{ fontSize:'0.82rem', color:'var(--ink-3)' }}><strong style={{ color:'var(--ink)' }}>{consultations.length}</strong> consultation(s)</div>
              <button onClick={() => setModal('consultation')} style={{ background:'var(--green)', color:'#fff', border:'none', borderRadius:'9px', padding:'0.6rem 1.1rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', fontFamily:'var(--sans)' }}>+ Nouvelle</button>
            </div>
            {consultations.length === 0 ? (
              <div style={{ textAlign:'center', padding:'4rem', background:'#fff', borderRadius:'16px', border:'1.5px solid var(--border)' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🩺</div>
                <p style={{ color:'var(--ink-3)' }}>Aucune consultation enregistrée</p>
              </div>
            ) : consultations.map(c => (
              <div key={c.id} onClick={() => setDossierSelectionne(c)}
                style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'14px', padding:'1.25rem', marginBottom:'10px', cursor:'pointer', transition:'all 0.2s', display:'flex', gap:'14px', alignItems:'flex-start' }}
                onMouseOver={e => { e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; }}>
                <div style={{ width:'42px', height:'42px', borderRadius:'11px', background:'var(--green-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>🩺</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--ink)' }}>Consultation — {c.medecin_nom || 'Médecin'}</span>
                    <span style={{ background:'#DCFCE7', color:'#166534', fontSize:'0.62rem', fontWeight:700, padding:'2px 7px', borderRadius:'6px' }}>✅ Terminée</span>
                  </div>
                  {c.motif && <div style={{ fontSize:'0.78rem', color:'var(--ink-2)' }}>💬 {c.motif}</div>}
                  {c.diagnostic && <div style={{ fontSize:'0.78rem', color:'var(--ink-3)', marginTop:'2px' }}>🔬 {c.diagnostic.substring(0,100)}{c.diagnostic.length>100?'...':''}</div>}
                  {c.ordonnance && <div style={{ fontSize:'0.72rem', color:'#0369A1', marginTop:'3px', background:'#DBEAFE', padding:'2px 8px', borderRadius:'5px', display:'inline-block' }}>💊 Ordonnance</div>}
                </div>
                <div style={{ fontSize:'0.72rem', color:'var(--ink-3)', flexShrink:0, textAlign:'right' }}>
                  {new Date(c.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ORDONNANCES ── */}
        {!loading && tel && onglet === 'ordonnances' && (
          <div>
            {consultations.filter(c => c.ordonnance).length === 0 ? (
              <div style={{ textAlign:'center', padding:'4rem', background:'#fff', borderRadius:'16px', border:'1.5px solid var(--border)' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>💊</div>
                <p style={{ color:'var(--ink-3)' }}>Aucune ordonnance enregistrée</p>
              </div>
            ) : consultations.filter(c => c.ordonnance).map(c => (
              <div key={c.id} style={{ border:'1.5px solid #BFDBFE', borderRadius:'14px', padding:'1.5rem', marginBottom:'12px', background:'#EFF6FF' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1rem' }}>
                  <span style={{ fontSize:'1.4rem' }}>💊</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:'0.875rem', color:'#1D4ED8' }}>Dr. {c.medecin_nom}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--ink-3)' }}>{new Date(c.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}</div>
                  </div>
                  <span style={{ background:'#DCFCE7', color:'#166534', fontSize:'0.68rem', fontWeight:700, padding:'3px 9px', borderRadius:'8px' }}>✅ Active</span>
                </div>
                <div style={{ background:'#fff', borderRadius:'10px', padding:'1rem', fontSize:'0.875rem', color:'var(--ink)', lineHeight:1.8, whiteSpace:'pre-wrap', border:'1px solid #BFDBFE', fontFamily:'monospace' }}>
                  {c.ordonnance}
                </div>
                {c.motif && <div style={{ fontSize:'0.75rem', color:'var(--ink-3)', marginTop:'8px' }}>Motif : {c.motif}</div>}
              </div>
            ))}
          </div>
        )}

        {/* ── CONSTANTES ── */}
        {!loading && tel && onglet === 'constantes' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1.25rem' }}>
              <div style={{ fontSize:'0.82rem', color:'var(--ink-3)' }}><strong style={{ color:'var(--ink)' }}>{constantes.length}</strong> mesure(s)</div>
              <button onClick={() => setModal('constantes')} style={{ background:'var(--green)', color:'#fff', border:'none', borderRadius:'9px', padding:'0.6rem 1.1rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', fontFamily:'var(--sans)' }}>+ Nouvelle mesure</button>
            </div>
            {constantes.length === 0 ? (
              <div style={{ textAlign:'center', padding:'4rem', background:'#fff', borderRadius:'16px', border:'1.5px solid var(--border)' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📊</div>
                <p style={{ color:'var(--ink-3)' }}>Aucune constante enregistrée</p>
              </div>
            ) : (
              <div>
                <GraphiquesConstantes constantes={constantes} />
                {constantes.map(c => (
                  <div key={c.id} style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'14px', padding:'1.25rem', marginBottom:'10px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                      <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--ink)' }}>📊 Mesures</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--ink-3)' }}>{new Date(c.date_mesure).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
                    </div>
                    <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                      {[
                        { icon:'🫀', label:'Tension', val:c.tension, unit:'mmHg' },
                        { icon:'⚖️', label:'Poids', val:c.poids, unit:'kg' },
                        { icon:'🩸', label:'Glycémie', val:c.glycemie, unit:'g/L' },
                        { icon:'🌡️', label:'Température', val:c.temperature, unit:'°C' },
                        { icon:'💓', label:'Pouls', val:c.pouls, unit:'bpm' }
                      ].filter(m => m.val).map(m => (
                        <div key={m.label} style={{ background:'var(--green-pale)', borderRadius:'10px', padding:'0.75rem 1rem', textAlign:'center', minWidth:'90px' }}>
                          <div style={{ fontSize:'1.1rem' }}>{m.icon}</div>
                          <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--ink)' }}>{m.val}<span style={{ fontSize:'0.6rem', color:'var(--ink-3)', marginLeft:'2px' }}>{m.unit}</span></div>
                          <div style={{ fontSize:'0.62rem', color:'var(--ink-3)' }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── VACCINATIONS ── */}
        {!loading && tel && onglet === 'vaccinations' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1.25rem' }}>
              <div style={{ fontSize:'0.82rem', color:'var(--ink-3)' }}><strong style={{ color:'var(--ink)' }}>{vaccinations.length}</strong> vaccination(s)</div>
              <button onClick={() => setModal('vaccin')} style={{ background:'var(--green)', color:'#fff', border:'none', borderRadius:'9px', padding:'0.6rem 1.1rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', fontFamily:'var(--sans)' }}>+ Vaccin</button>
            </div>
            {vaccinations.length === 0 ? (
              <div style={{ textAlign:'center', padding:'4rem', background:'#fff', borderRadius:'16px', border:'1.5px solid var(--border)' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>💉</div>
                <p style={{ color:'var(--ink-3)' }}>Aucune vaccination enregistrée</p>
              </div>
            ) : vaccinations.map(v => (
              <div key={v.id} style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'14px', padding:'1.25rem', marginBottom:'10px', display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ width:'42px', height:'42px', borderRadius:'11px', background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>💉</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--ink)' }}>{v.vaccin}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--ink-3)', marginTop:'2px' }}>
                    {v.date_vaccination && <>Administré le {new Date(v.date_vaccination).toLocaleDateString('fr-FR')}</>}
                    {v.medecin_nom && ` · Dr. ${v.medecin_nom}`}
                  </div>
                </div>
                {v.prochain_rappel && (
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:'0.68rem', color:'var(--ink-3)' }}>Prochain rappel</div>
                    <div style={{ fontSize:'0.82rem', fontWeight:600, color: new Date(v.prochain_rappel) < new Date() ? '#DC2626' : '#006B3F' }}>
                      {new Date(v.prochain_rappel).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {!loading && tel && onglet === 'documents' && (
          <div style={{ textAlign:'center', padding:'4rem', background:'#fff', borderRadius:'16px', border:'1.5px solid var(--border)' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📄</div>
            <h3 style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', color:'var(--ink)', marginBottom:'0.5rem' }}>Documents médicaux</h3>
            <p style={{ color:'var(--ink-3)', fontSize:'0.875rem' }}>Résultats d'analyses, radios, comptes-rendus — bientôt disponible</p>
          </div>
        )}
      </main>

      {/* ── MODAL DÉTAIL CONSULTATION ── */}
      {dossierSelectionne && (
        <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
          onClick={e => e.target===e.currentTarget && setDossierSelectionne(null)}>
          <div style={{ background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'580px', overflow:'hidden', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ background:'linear-gradient(135deg,#0E1510,#1A3020)', padding:'1.5rem', display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ fontSize:'1.5rem' }}>🩺</div>
              <div>
                <div style={{ color:'#fff', fontFamily:'var(--serif)', fontSize:'1.05rem' }}>Consultation — {dossierSelectionne.medecin_nom}</div>
                <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.78rem' }}>{new Date(dossierSelectionne.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}</div>
              </div>
              <button onClick={() => setDossierSelectionne(null)} style={{ marginLeft:'auto', background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:'32px', height:'32px', borderRadius:'50%', fontSize:'1rem', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              {[
                { label:'Motif', val:dossierSelectionne.motif, icon:'💬', bg:'var(--green-pale)' },
                { label:'Diagnostic', val:dossierSelectionne.diagnostic, icon:'🔬', bg:'#EFF6FF' },
                { label:'Ordonnance', val:dossierSelectionne.ordonnance, icon:'💊', bg:'#EFF6FF', mono:true },
                { label:'Notes médicales', val:dossierSelectionne.notes, icon:'📝', bg:'var(--green-pale)' },
                { label:'Allergies', val:dossierSelectionne.allergies, icon:'⚠️', bg:'#FEF2F2' },
                { label:'Antécédents', val:dossierSelectionne.antecedents, icon:'📋', bg:'var(--green-pale)' },
                { label:'Traitements', val:dossierSelectionne.traitements_en_cours, icon:'💊', bg:'#DBEAFE' }
              ].filter(f => f.val).map(f => (
                <div key={f.label} style={{ background:f.bg, border:'1px solid var(--border)', borderRadius:'10px', padding:'1rem' }}>
                  <div style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px' }}>{f.icon} {f.label}</div>
                  <div style={{ fontSize:'0.875rem', color:'var(--ink)', lineHeight:1.6, whiteSpace:'pre-wrap', fontFamily: f.mono ? 'monospace' : 'inherit' }}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONSULTATION ── */}
      {modal === 'consultation' && (
        <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
          onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div style={{ background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'640px', overflow:'hidden', maxHeight:'92vh', overflowY:'auto' }}>
            <div style={{ background:'linear-gradient(135deg,#0E1510,#1A3020)', padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ color:'#fff', fontFamily:'var(--serif)', fontSize:'1.05rem' }}>🩺 Nouvelle consultation</div>
              <button onClick={() => setModal(null)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:'30px', height:'30px', borderRadius:'50%', cursor:'pointer', fontSize:'0.9rem' }}>✕</button>
            </div>
            <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Patient</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {[
                  { label:'Prénom *', key:'patient_prenom', placeholder:'Prénom' },
                  { label:'Nom *', key:'patient_nom', placeholder:'Nom' },
                  { label:'Téléphone *', key:'patient_tel', placeholder:'+221 7X XXX XX XX' },
                  { label:'Date de naissance', key:'date_naissance', type:'date' },
                  { label:'Groupe sanguin', key:'groupe_sanguin', placeholder:'A+, B-, O+...' },
                  { label:'Taille (cm)', key:'taille', type:'number', placeholder:'175' },
                  { label:'Poids (kg)', key:'poids', type:'number', placeholder:'70' },
                  { label:'Médecin traitant', key:'medecin_traitant', placeholder:'Nom du médecin traitant' }
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--ink-2)', display:'block', marginBottom:'4px' }}>{f.label}</label>
                    <input type={f.type||'text'} placeholder={f.placeholder||''} value={formConsult[f.key]||''}
                      onChange={e => setFormConsult(p => ({...p, [f.key]:e.target.value}))}
                      style={inp} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:'4px' }}>Médecin & Consultation</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div>
                  <label style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--ink-2)', display:'block', marginBottom:'4px' }}>Médecin</label>
                  <input type="text" placeholder="Dr. Nom" value={formConsult.medecin_nom} onChange={e => setFormConsult(p => ({...p, medecin_nom:e.target.value}))} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--ink-2)', display:'block', marginBottom:'4px' }}>Motif</label>
                  <input type="text" placeholder="Motif de consultation" value={formConsult.motif} onChange={e => setFormConsult(p => ({...p, motif:e.target.value}))} style={inp} />
                </div>
              </div>
              {[
                { label:'Diagnostic', key:'diagnostic', placeholder:'Diagnostic établi...' },
                { label:'Ordonnance', key:'ordonnance', placeholder:'Médicaments prescrits, posologie, durée...' },
                { label:'Allergies connues', key:'allergies', placeholder:'Médicaments, aliments, autres...' },
                { label:'Antécédents médicaux', key:'antecedents', placeholder:'Maladies chroniques, chirurgies...' },
                { label:'Traitements en cours', key:'traitements_en_cours', placeholder:'Médicaments pris actuellement...' },
                { label:'Notes médicales', key:'notes', placeholder:'Observations, suivi à prévoir...' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--ink-2)', display:'block', marginBottom:'4px' }}>{f.label}</label>
                  <textarea placeholder={f.placeholder} value={formConsult[f.key]} onChange={e => setFormConsult(p => ({...p, [f.key]:e.target.value}))} rows={2} style={ta} />
                </div>
              ))}
              <button onClick={sauvegarderConsult} disabled={saving} style={{ width:'100%', padding:'0.85rem', background:'linear-gradient(135deg,var(--green),var(--green-mid))', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', opacity:saving?0.7:1, fontFamily:'var(--sans)' }}>
                {saving ? 'Sauvegarde...' : '💾 Sauvegarder la consultation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONSTANTES ── */}
      {modal === 'constantes' && (
        <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
          onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div style={{ background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'480px', overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg,#0E1510,#1A3020)', padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ color:'#fff', fontFamily:'var(--serif)', fontSize:'1.05rem' }}>📊 Nouvelles constantes</div>
              <button onClick={() => setModal(null)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:'30px', height:'30px', borderRadius:'50%', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'1.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {[
                { label:'Tension artérielle', key:'tension', placeholder:'120/80 mmHg', icon:'🫀' },
                { label:'Poids (kg)', key:'poids', type:'number', placeholder:'70', icon:'⚖️' },
                { label:'Glycémie (g/L)', key:'glycemie', placeholder:'0.8 g/L', icon:'🩸' },
                { label:'Température (°C)', key:'temperature', type:'number', placeholder:'37.0', icon:'🌡️' },
                { label:'Pouls (bpm)', key:'pouls', type:'number', placeholder:'75', icon:'💓' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--ink-2)', display:'block', marginBottom:'4px' }}>{f.icon} {f.label}</label>
                  <input type={f.type||'text'} placeholder={f.placeholder} value={formConstantes[f.key]}
                    onChange={e => setFormConstantes(p => ({...p, [f.key]:e.target.value}))}
                    style={inp} />
                </div>
              ))}
              <div style={{ gridColumn:'1/-1' }}>
                <button onClick={sauvegarderConstantes} disabled={saving} style={{ width:'100%', padding:'0.85rem', background:'linear-gradient(135deg,var(--green),var(--green-mid))', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', opacity:saving?0.7:1, fontFamily:'var(--sans)' }}>
                  {saving ? 'Sauvegarde...' : '💾 Enregistrer les constantes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL VACCIN ── */}
      {modal === 'vaccin' && (
        <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
          onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div style={{ background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'460px', overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg,#0E1510,#1A3020)', padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ color:'#fff', fontFamily:'var(--serif)', fontSize:'1.05rem' }}>💉 Nouvelle vaccination</div>
              <button onClick={() => setModal(null)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:'30px', height:'30px', borderRadius:'50%', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              {[
                { label:'Nom du vaccin *', key:'vaccin', placeholder:'Ex: BCG, Fièvre jaune, COVID-19...' },
                { label:'Date de vaccination', key:'date_vaccination', type:'date' },
                { label:'Prochain rappel', key:'prochain_rappel', type:'date' },
                { label:'Médecin', key:'medecin_nom', placeholder:'Nom du médecin' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--ink-2)', display:'block', marginBottom:'4px' }}>{f.label}</label>
                  <input type={f.type||'text'} placeholder={f.placeholder||''} value={formVaccin[f.key]}
                    onChange={e => setFormVaccin(p => ({...p, [f.key]:e.target.value}))}
                    style={inp} />
                </div>
              ))}
              <button onClick={sauvegarderVaccin} disabled={saving} style={{ width:'100%', padding:'0.85rem', background:'linear-gradient(135deg,var(--green),var(--green-mid))', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', opacity:saving?0.7:1, fontFamily:'var(--sans)' }}>
                {saving ? 'Sauvegarde...' : '💾 Enregistrer la vaccination'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ background:'var(--ink)', color:'rgba(255,255,255,0.5)', padding:'2rem 3rem', textAlign:'center', fontSize:'0.82rem', marginTop:'4rem' }}>
        © 2024 DataforiaSanté · Sénégal 🇸🇳
      </footer>
    </div>
  );
}