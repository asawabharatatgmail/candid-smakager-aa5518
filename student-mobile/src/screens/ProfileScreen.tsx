import { User, trialDaysLeft, clearSession } from '../services/api';

interface Props {
  user: User;
  onLogout: () => void;
  showToast: (msg: string, type?: 'error' | 'success') => void;
}

function statusLabel(u: User): string {
  if (u.subscription_status === 'active') return '✅ Active Subscription';
  if (u.subscription_status === 'trial') {
    const d = trialDaysLeft(u);
    return `⏱ Free Trial — ${d} day${d !== 1 ? 's' : ''} left`;
  }
  return '❌ Expired';
}

function statusColor(u: User): string {
  if (u.subscription_status === 'active') return 'var(--success)';
  if (u.subscription_status === 'trial' && trialDaysLeft(u) > 3) return 'var(--success)';
  if (u.subscription_status === 'trial') return 'var(--warn)';
  return 'var(--danger)';
}

function formatDate(d?: string): string {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProfileScreen({ user, onLogout, showToast }: Props) {
  function handleLogout() {
    clearSession();
    showToast('Logged out successfully', 'success');
    setTimeout(onLogout, 400);
  }

  return (
    <div className="screen">
      <div className="screen-inner" style={{ paddingTop: 24 }}>
        {/* Avatar */}
        <div className="profile-avatar">{initials(user.name)}</div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>

        {/* Account Info */}
        <div className="section-title">Account Details</div>
        <div className="info-list">
          <div className="info-row">
            <span className="info-key">Status</span>
            <span className="info-val" style={{ color: statusColor(user) }}>{statusLabel(user)}</span>
          </div>
          {user.subscription_expiry && (
            <div className="info-row">
              <span className="info-key">
                {user.subscription_status === 'trial' ? 'Trial Ends' : 'Expires On'}
              </span>
              <span className="info-val">{formatDate(user.subscription_expiry)}</span>
            </div>
          )}
          {user.mobile && (
            <div className="info-row">
              <span className="info-key">Mobile</span>
              <span className="info-val">{user.mobile}</span>
            </div>
          )}
          {user.city && (
            <div className="info-row">
              <span className="info-key">City</span>
              <span className="info-val">{user.city}</span>
            </div>
          )}
          {user.created_at && (
            <div className="info-row">
              <span className="info-key">Member Since</span>
              <span className="info-val">{formatDate(user.created_at)}</span>
            </div>
          )}
        </div>

        {/* App Info */}
        <div className="section-title">About</div>
        <div className="info-list">
          {[
            { key: 'App', val: 'System4Learn Student' },
            { key: 'Version', val: '1.0.0' },
            { key: 'Platform', val: 'Android' },
          ].map(r => (
            <div key={r.key} className="info-row">
              <span className="info-key">{r.key}</span>
              <span className="info-val" style={{ color: 'var(--text-2)' }}>{r.val}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="section-title">What's Included</div>
        <div className="card" style={{ padding: 18 }}>
          {[
            '🤖 Unlimited AI Study Help',
            '🏆 Subject-wise Challenges',
            '📊 Progress Tracking',
            '📱 Mobile-first Design',
            '⚡ Instant Answers',
            '🎯 Personalised Learning',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 15 }}>{f}</span>
            </div>
          ))}
        </div>

        {user.subscription_status !== 'active' && (
          <div className="card" style={{ background: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)', marginTop: 16, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>🚀</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Upgrade for Full Access</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Contact your institute or visit system4learn.com to upgrade your subscription.
            </div>
          </div>
        )}

        {/* Logout */}
        <button className="btn btn-danger btn-full" style={{ marginTop: 24 }} onClick={handleLogout}>
          🚪 Logout
        </button>

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
