const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  try {
    // Delete existing auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      'ac2150b6-fdc0-480f-8cb7-978b1514ea97'
    );
    if (deleteError) return res.status(500).json({ error: 'Delete failed: ' + deleteError.message });

    // Recreate with known password
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: 'mena@maimonelegal.com',
      password: 'MigraTrak2026!',
      email_confirm: true
    });
    if (createError) return res.status(500).json({ error: 'Create failed: ' + createError.message });

    // Update public.users with new auth id
    const { error: updateError } = await supabase
      .from('users')
      .update({ id: data.user.id })
      .eq('email', 'mena@maimonelegal.com');
    if (updateError) return res.status(500).json({ error: 'Update failed: ' + updateError.message });

    return res.status(200).json({ success: true, newId: data.user.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
