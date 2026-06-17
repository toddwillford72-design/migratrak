const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase.auth.admin.updateUserById(
      'ac2150b6-fdc0-480f-8cb7-978b1514ea97',
      { password: 'Demo2026!' }
    );

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, email: data.user.email });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
