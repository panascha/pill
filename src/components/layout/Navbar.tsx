import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'

const NAV_LINKS = [
  { to: '/', label: 'ค้นหายา' },
  { to: '/quiz', label: 'ทำข้อสอบ' },
  { to: '/cases', label: 'เคสคลินิก' },
  { to: '/contribute', label: 'เสนอเพิ่ม' },
]

export function Navbar() {
  const { user, role, signIn, signOut, loading } = useAuth()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-surface-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-ink shrink-0">
          <span className="text-accent text-lg">Rx</span>
          <span className="hidden sm:inline text-sm">PharmQuiz</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                location.pathname === to
                  ? 'bg-accent-light text-accent font-medium'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-subtle'
              }`}
            >
              {label}
            </Link>
          ))}
          {role === 'admin' && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-accent-light text-accent font-medium'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-subtle'
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-surface-border animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-ink-muted">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut}>ออก</Button>
            </div>
          ) : (
            <Button size="sm" onClick={signIn}>เข้าสู่ระบบ</Button>
          )}
        </div>
      </div>
    </header>
  )
}
