import { Link, useRoute } from '../router.jsx';
import { useStore } from '../store.jsx';

const PATHS = {
  back: <path d="M15 5l-7 7 7 7" />,
  chevron: <path d="M9 5l7 7-7 7" />,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  child: <><circle cx="12" cy="12" r="9" /><path d="M8.5 14a4 4 0 0 0 7 0" /><path d="M9 9.5h.01M15 9.5h.01" /></>,
  inbox: <><path d="M4 13h4l1.5 3h5L16 13h4" /><path d="M5 5h14l1 8v6H4v-6z" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></>,
  hospital: <><path d="M4 21V7l8-4 8 4v14" /><path d="M12 9v6M9 12h6" /><path d="M2 21h20" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  alert: <><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17h.01" /></>,
  shield: <><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
  chart: <><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.9-3.5M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.9 3.5M20 20v-4h-4" /></>,
  baby: <><circle cx="12" cy="7" r="3.5" /><path d="M6 21v-3a6 6 0 0 1 12 0v3" /><path d="M10.5 7h.01M13.5 7h.01" /></>,
  lungs: <><path d="M12 3v8" /><path d="M12 11c-1.5 0-3-2-4.5-4S3 6 3 10v6c0 2.5 2 4 4.5 3.5S10 17 10 15v-2" /><path d="M12 11c1.5 0 3-2 4.5-4S21 6 21 10v6c0 2.5-2 4-4.5 3.5S14 17 14 15v-2" /></>,
  heartPulse: <><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /><path d="M3 12h4l1.5-3 3 6 1.5-3h8" /></>,
  brain: <><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3z" /><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3h0a3 3 0 0 1-3-3" /></>,
  pill: <><rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-45 12 12.5)" /><path d="M9.5 10l5 5" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" /></>,
  scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M4 12h16" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2 20a7 7 0 0 1 14 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 20a7 7 0 0 0-4-6.3" /></>,
  map: <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  stethoscope: <><path d="M5 3v5a5 5 0 0 0 10 0V3" /><path d="M10 13v2a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="11" r="2" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" /></>,
  sos: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5h.01" /></>,
  cloud: <><path d="M7 18a5 5 0 1 1 .8-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z" /><path d="M9.5 13.5l2 2 3.5-4" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  home2: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" /></>
};

export const TONES = {
  coral: { bg: '#FBE7DF', fg: '#9A3412' },
  amber: { bg: '#FFF1D6', fg: '#7A4300' },
  red: { bg: '#FDE4E2', fg: '#A3211A' },
  purple: { bg: '#EEE6FA', fg: '#5B2E91' },
  teal: { bg: '#E1F0EC', fg: '#0B6E5F' },
  blue: { bg: '#DCEBFA', fg: '#1E4F8A' },
  slate: { bg: '#EEF1F0', fg: '#3D4945' }
};

// Ikon menu bergaya aplikasi layanan (JKN Mobile): kotak berwarna + label di bawah.
export function MenuIcon({ to, icon, label, tone = 'teal', badge, onClick }) {
  const t = TONES[tone];
  const inner = (
    <>
      <span className="menu-ico" style={{ background: t.bg, color: t.fg }}>
        <Icon name={icon} size={26} stroke={1.8} />
        {badge ? <span className="menu-badge">{badge}</span> : null}
      </span>
      <span className="menu-label">{label}</span>
    </>
  );
  return onClick
    ? <button type="button" className="menu-item" onClick={onClick}>{inner}</button>
    : <Link to={to} className="menu-item">{inner}</Link>;
}

export function Icon({ name, size = 22, stroke = 1.9, fill = 'none', className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      {PATHS[name]}
    </svg>
  );
}

export function TopBar({ title, backTo, right }) {
  return (
    <header className="topbar">
      {backTo !== undefined ? (
        <Link to={backTo} className="icon-btn ghost" aria-label="Kembali"><Icon name="back" stroke={2} /></Link>
      ) : null}
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-right">{right}</div>
    </header>
  );
}

// Navigasi bawah seragam untuk semua peran: 5 slot di posisi yang sama, tombol QR selalu di tengah.
const NAV = {
  pasien: [
    { to: '/', icon: 'home2', label: 'Beranda' },
    { to: '/riwayat', icon: 'history', label: 'Riwayat' },
    { to: '/kartu', icon: 'qr', label: 'Kartu QR', center: true },
    { to: '/notifikasi', icon: 'bell', label: 'Notifikasi', badge: 'notif' },
    { to: '/akun', icon: 'user', label: 'Akun' }
  ],
  dokter: [
    { to: '/dokter', icon: 'home2', label: 'Beranda' },
    { to: '/dokter/pasien', icon: 'users', label: 'Pasien' },
    { to: '/dokter/scan', icon: 'scan', label: 'Scan QR', center: true },
    { to: '/dokter/notifikasi', icon: 'bell', label: 'Darurat', badge: 'alerts' },
    { to: '/akun', icon: 'user', label: 'Akun' }
  ],
  kader: [
    { to: '/perawat', icon: 'home2', label: 'Beranda' },
    { to: '/perawat/pasien', icon: 'users', label: 'Pasien' },
    { to: '/perawat/scan', icon: 'scan', label: 'Scan QR', center: true },
    { to: '/perawat/notifikasi', icon: 'bell', label: 'Darurat', badge: 'alerts' },
    { to: '/akun', icon: 'user', label: 'Akun' }
  ]
};

function activeSlot(role, parts) {
  const [a, b] = parts;
  if (a === 'akun') return 4;
  if (role === 'pasien') return { riwayat: 1, kartu: 2, notifikasi: 3 }[a] ?? 0;
  return { pasien: 1, scan: 2, notifikasi: 3 }[b] ?? 0;
}

export function BottomNav() {
  const { parts } = useRoute();
  const { state, newCount } = useStore();
  const items = NAV[state.role];
  const slot = activeSlot(state.role, parts);
  const actor = state.role === 'kader' ? 'perawat' : state.doctorId;
  const alertCount = state.doctorAlerts.filter((a) => (actor === 'perawat' || a.doctorIds.includes(actor)) && !a.handled[actor]).length;
  const emergency = state.notifications.some((n) => n.patientId === state.patientId && n.kind === 'emergency' && !state.seenNotif[n.id]);
  return (
    <nav className="bottomnav" aria-label="Menu utama">
      {items.map((it, i) => {
        const active = slot === i;
        const count = it.badge === 'notif' ? newCount : it.badge === 'alerts' ? alertCount : 0;
        const red = it.badge === 'alerts' || emergency;
        return (
          <Link key={it.to} to={it.to} className={'nav-item' + (active ? ' active' : '') + (it.center ? ' center' : '')} aria-current={active ? 'page' : undefined}>
            <span className="nav-icon">
              <Icon name={it.icon} size={it.center ? 26 : 22} />
              {count ? <span className="nav-badge" style={red ? { background: '#B3261E' } : null}>{count}</span> : null}
            </span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Chip({ tone = 'ok', children }) {
  return <span className={'chip chip-' + tone}>{children}</span>;
}

export function SourceTag({ children = 'Dari rekam medis RS JIH Solo' }) {
  return (
    <div className="source-tag">
      <Icon name="hospital" size={18} />
      <span>{children}</span>
    </div>
  );
}

export function Avatar({ initials, tone = 'coral', size = 34 }) {
  return <span className={'avatar avatar-' + tone} style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials}</span>;
}

export function Progress({ value, tone = 'teal' }) {
  return <span className={'progress progress-' + tone}><span style={{ width: Math.min(100, value) + '%' }} /></span>;
}
