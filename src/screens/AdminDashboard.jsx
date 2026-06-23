import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mt_admin_auth';
const CODE_KEY = 'mt_admin_code';

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function Badge({ active }) {
  return active
    ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
    : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactive</span>;
}

function fmt(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

function fmtMoney(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function AdminDashboard() {
  const [authed, setAuthed]     = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [data, setData]         = useState(null);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    const storedCode = sessionStorage.getItem(CODE_KEY);
    if (storedCode) {
      fetchStats(storedCode);
    }
  }, []);

  async function fetchStats(code) {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/admin-stats', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ passcode: code }),
      });
      const json = await res.json();
      if (json.error) {
        setError('Incorrect passcode.');
        sessionStorage.removeItem(CODE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      sessionStorage.setItem(STORAGE_KEY, 'true');
      sessionStorage.setItem(CODE_KEY, code);
      setAuthed(true);
      setData(json);
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(CODE_KEY);
    setAuthed(false);
    setData(null);
    setPasscode('');
    setError('');
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-1">MigraTrak Admin</h1>
          <p className="text-sm text-gray-500 mb-6">Internal use only</p>
          <input
            type="password"
            placeholder="Passcode"
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchStats(passcode)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          {loading && <p className="text-gray-400 text-xs mb-3">Checking...</p>}
          <button
            onClick={() => fetchStats(passcode)}
            disabled={loading || !passcode}
            className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading stats…</p>
      </div>
    );
  }

  const { stats, users } = data;

  const filteredUsers = users.filter(u => {
    if (filter === 'clients')   return u.role === 'client';
    if (filter === 'attorneys') return u.role === 'attorney';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">MigraTrak Admin</h1>
          <p className="text-xs text-gray-400">Beta monitoring dashboard</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => fetchStats(sessionStorage.getItem(CODE_KEY))}
            disabled={loading}
            className="text-xs text-blue-600 disabled:opacity-40"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Users"    value={stats.totalUsers}    sub={`${stats.totalClients} clients · ${stats.totalAttorneys} attorneys`} />
          <StatCard label="Active (14d)"   value={stats.activeUsers}   sub="Logged in last 14 days" />
          <StatCard label="New (7d / 30d)" value={`${stats.newSignups7} / ${stats.newSignups30}`} sub="Signups" />
          <StatCard label="Prospects"      value={stats.prospectsTotal} sub={`Avg score ${stats.avgProspectScore}`} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Expenses Logged"   value={stats.totalExpenseCount}   sub={fmtMoney(stats.totalExpenseAmount) + ' total'} />
          <StatCard label="Docs Uploaded"     value={stats.docsUploaded}        sub={`${stats.docsPending} pending`} />
          <StatCard label="Milestones Done"   value={stats.milestonesCompleted} sub={`of ${stats.milestonesTotal} total`} />
          <StatCard label="Prospects Intro'd" value={stats.prospectsByStatus?.intro_sent || 0} sub={`${stats.prospectsByStatus?.none || 0} not contacted`} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">All Users</h2>
            <div className="flex gap-2">
              {['all', 'clients', 'attorneys'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1 rounded-full ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Role / Visa</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Last Login</th>
                  <th className="text-left px-4 py-3 font-medium">Joined</th>
                  <th className="text-right px-4 py-3 font-medium">Expenses</th>
                  <th className="text-right px-4 py-3 font-medium">Milestones</th>
                  <th className="text-right px-4 py-3 font-medium">Clients</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{u.name || '—'}</p>
                      <p className="text-gray-400 truncate max-w-[160px]">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="capitalize text-gray-700">{u.role}</p>
                      <p className="text-gray-400">{u.visa_type || '—'}</p>
                    </td>
                    <td className="px-4 py-3"><Badge active={u.is_active} /></td>
                    <td className="px-4 py-3 text-gray-600">{fmt(u.last_sign_in_at)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(u.created_at)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {u.role === 'client' ? `${u.expense_count} · ${fmtMoney(u.expense_total)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {u.role === 'client' ? `${u.milestones_completed}/${u.milestones_total}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {u.role === 'attorney' ? (u.client_count ?? '—') : '—'}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
