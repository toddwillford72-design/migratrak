import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'FieldCore2026!';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { passcode } = req.body;
  if (passcode !== ADMIN_PASSCODE) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [
      { data: allUsers },
      { data: authData },
      { data: expenses },
      { data: documents },
      { data: milestones },
      { data: attorneyClients },
      { data: prospects },
    ] = await Promise.all([
      supabaseAdmin.from('users').select('id, name, email, role, visa_type, created_at, firm_name').order('created_at', { ascending: false }),
      supabaseAdmin.auth.admin.listUsers(),
      supabaseAdmin.from('expenses').select('id, amount, user_id, created_at'),
      supabaseAdmin.from('documents').select('id, status, user_id'),
      supabaseAdmin.from('milestones').select('id, status, user_id'),
      supabaseAdmin.from('attorney_clients').select('attorney_id, client_id'),
      supabaseAdmin.from('prospects').select('id, score, intro_status, created_at'),
    ]);

    const now = new Date();
    const last7  = new Date(now - 7  * 86400000);
    const last30 = new Date(now - 30 * 86400000);
    const last14 = new Date(now - 14 * 86400000);

    // Auth lookup map
    const authMap = {};
    (authData?.users || []).forEach(u => { authMap[u.id] = u.last_sign_in_at; });

    const clients   = (allUsers || []).filter(u => u.role === 'client');
    const attorneys = (allUsers || []).filter(u => u.role === 'attorney');

    const newSignups7  = (allUsers || []).filter(u => new Date(u.created_at) > last7).length;
    const newSignups30 = (allUsers || []).filter(u => new Date(u.created_at) > last30).length;
    const activeUsers  = (authData?.users || []).filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > last14).length;

    const totalExpenseCount  = expenses?.length || 0;
    const totalExpenseAmount = (expenses || []).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    const docsUploaded = (documents || []).filter(d => d.status === 'uploaded').length;
    const docsPending  = (documents || []).filter(d => d.status === 'pending').length;

    const milestonesCompleted = (milestones || []).filter(m => m.status === 'completed').length;
    const milestonesTotal     = milestones?.length || 0;

    // Attorney → client count map
    const attorneyClientCounts = {};
    (attorneyClients || []).forEach(ac => {
      attorneyClientCounts[ac.attorney_id] = (attorneyClientCounts[ac.attorney_id] || 0) + 1;
    });

    // Prospects
    const prospectsTotal = prospects?.length || 0;
    const prospectsByStatus = {};
    (prospects || []).forEach(p => {
      const key = p.intro_status || 'none';
      prospectsByStatus[key] = (prospectsByStatus[key] || 0) + 1;
    });
    const avgProspectScore = prospectsTotal
      ? Math.round((prospects || []).reduce((sum, p) => sum + (p.score || 0), 0) / prospectsTotal)
      : 0;

    // Enriched user rows
    const userList = (allUsers || []).map(u => {
      const uExpenses   = (expenses   || []).filter(e => e.user_id === u.id);
      const uMilestones = (milestones || []).filter(m => m.user_id === u.id);
      return {
        ...u,
        last_sign_in_at:      authMap[u.id] || null,
        is_active:            authMap[u.id] ? new Date(authMap[u.id]) > last14 : false,
        expense_count:        uExpenses.length,
        expense_total:        uExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
        milestones_completed: uMilestones.filter(m => m.status === 'completed').length,
        milestones_total:     uMilestones.length,
        client_count:         u.role === 'attorney' ? (attorneyClientCounts[u.id] || 0) : null,
      };
    });

    return res.status(200).json({
      stats: {
        totalUsers: allUsers?.length || 0,
        totalClients: clients.length,
        totalAttorneys: attorneys.length,
        newSignups7,
        newSignups30,
        activeUsers,
        totalExpenseCount,
        totalExpenseAmount,
        docsUploaded,
        docsPending,
        milestonesCompleted,
        milestonesTotal,
        prospectsTotal,
        prospectsByStatus,
        avgProspectScore,
      },
      users: userList,
    });

  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ error: 'Failed to load stats' });
  }
}
