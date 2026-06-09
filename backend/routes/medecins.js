const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET /api/medecins
router.get('/', async (req, res) => {
  try {
    const { spec, ville, dispo } = req.query;

    let query = supabase.from('medecins').select('*');

    if (spec) query = query.ilike('spec', `%${spec}%`);
    if (ville) query = query.ilike('ville', `%${ville}%`);
    if (dispo === 'true') query = query.eq('dispo', true);

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data, total: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/medecins/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('medecins')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Médecin non trouvé' });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;