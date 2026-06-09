const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../supabase');

// GET /api/hopitaux
router.get('/', async (req, res) => {
  try {
    const { ville, statut, service } = req.query;
    let query = supabase.from('hopitaux').select('*');
    if (ville) query = query.ilike('ville', `%${ville}%`);
    if (statut) query = query.eq('statut', statut);
    const { data, error } = await query;
    if (error) throw error;

    let result = data;
    if (service) result = result.filter(h => h.services && h.services.some(s => s.toLowerCase().includes(service.toLowerCase())));
    result.sort((a, b) => b.lits_libres - a.lits_libres);

    res.json({ success: true, data: result, total: result.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hopitaux/disponibles
router.get('/disponibles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('hopitaux')
      .select('*')
      .neq('statut', 'critique')
      .gt('lits_libres', 0)
      .order('lits_libres', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hopitaux/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('hopitaux')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/hopitaux/:id/lits
router.patch('/:id/lits', async (req, res) => {
  try {
    const { lits_libres } = req.body;
    const { data: hopital } = await supabase.from('hopitaux').select('*').eq('id', req.params.id).single();
    const occupation = Math.round(((hopital.lits_total - lits_libres) / hopital.lits_total) * 100);

    const { data, error } = await supabase
      .from('hopitaux')
      .update({ lits_libres, occupation })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;