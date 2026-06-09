import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Accueil from './pages/Accueil';
import Medecins from './pages/Medecins';
import Pharmacies from './pages/Pharmacies';
import Hopitaux from './pages/Hopitaux';
import ProfilMedecin from './pages/ProfilMedecin';
import Ordonnance from './pages/Ordonnance';
import Teleconsultation from './pages/Teleconsultation';
import Connexion from './pages/Connexion';
import EspaceMedecin from './pages/EspaceMedecin';
import EspacePharmacie from './pages/EspacePharmacie';
import EspaceHopital from './pages/EspaceHopital';
import DossierMedical from './pages/DossierMedical';
import DatoBot from './pages/DatoBot';
import Paiement from './pages/Paiement';
import AutourDeMoi from './pages/AutourDeMoi';
import DonnerAvis from './pages/DonnerAvis';
import Articles from './pages/Articles';
import Examens from './pages/Examens';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/medecins" element={<Medecins />} />
        <Route path="/medecins/:id" element={<ProfilMedecin />} />
        <Route path="/pharmacies" element={<Pharmacies />} />
        <Route path="/hopitaux" element={<Hopitaux />} />
        <Route path="/ordonnance" element={<Ordonnance />} />
        <Route path="/teleconsultation" element={<Teleconsultation />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/espace-medecin" element={<EspaceMedecin />} />
        <Route path="/espace-pharmacie" element={<EspacePharmacie />} />
        <Route path="/espace-hopital" element={<EspaceHopital />} />
        <Route path="/dossier-medical" element={<DossierMedical />} />
        <Route path="/datobot" element={<DatoBot />} />
        <Route path="/paiement" element={<Paiement />} />
        <Route path="/autour-de-moi" element={<AutourDeMoi />} />
        <Route path="/avis" element={<DonnerAvis />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/examens" element={<Examens />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;