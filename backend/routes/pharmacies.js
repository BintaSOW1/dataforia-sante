const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET /api/pharmacies
router.get('/', async (req, res) => {
  try {
    const { garde, livraison } = req.query;
    let query = supabase.from('pharmacies').select('*');
    if (garde === 'true') query = query.eq('garde', true);
    if (livraison === 'true') query = query.eq('livraison', true);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/pharmacies/medicaments
router.get('/medicaments', async (req, res) => {
  try {
    const { nom } = req.query;
    let query = supabase.from('medicaments').select('*');
    if (nom) query = query.ilike('nom', `%${nom}%`);
    const { data: meds, error } = await query;
    if (error) throw error;

    // Pour chaque médicament, chercher les pharmacies qui ont le stock
    const enriched = await Promise.all(meds.map(async (med) => {
      const { data: stocks } = await supabase
        .from('stock')
        .select('*, pharmacies(*)')
        .eq('medicament_id', med.id)
        .eq('disponible', true);

      return {
        ...med,
        disponible_dans: (stocks || []).map(s => ({
          id: s.pharmacies.id,
          nom: s.pharmacies.nom,
          ville: s.pharmacies.ville,
          livraison: s.pharmacies.livraison,
          delai: s.pharmacies.delai
        }))
      };
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/pharmacies/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;