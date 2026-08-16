import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { CheckoutPanel } from '../components/dashboard/CheckoutPanel'
import { WalletPanel } from '../components/dashboard/WalletPanel'
import { WithdrawalPanel } from '../components/dashboard/WithdrawalPanel'
import { useAuth } from '../context/AuthContext'

type DashboardView = 'wallet' | 'withdrawal' | 'checkout'

export function DashboardPage({ onBack }: { onBack: () => void }) {
  const { user, logout } = useAuth()
  const [activeView, setActiveView] = useState<DashboardView>('wallet')

  const handleLogout = () => {
    logout()
    onBack()
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(170,59,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,189,89,0.14),transparent_20%),linear-gradient(135deg,#000000_0%,#0f172a_30%,#020617_100%)] px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c084fc]">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Bem-vindo, {user?.name || 'Merchant'}</h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2 font-medium text-white transition hover:border-[#a855f7]/60 hover:text-[#d8b4fe]"
          >
            <LogOut size={18} />
            Sair
          </button>
        </header>

        <nav className="mb-8 flex flex-wrap gap-3 rounded-[22px] border border-white/10 bg-white/5 p-3">
          {[
            { key: 'wallet', label: 'Carteira e extrato' },
            { key: 'withdrawal', label: 'Solicitar saque' },
            { key: 'checkout', label: 'Checkout / Pix / Cartão' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveView(item.key as DashboardView)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeView === item.key
                  ? 'bg-linear-to-r from-[#aa3bff] to-[#8b5cf6] text-white shadow-[0_12px_25px_rgba(168,85,247,0.25)]'
                  : 'bg-black/10 text-[#d1d5db] hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {activeView === 'wallet' ? (
          <WalletPanel />
        ) : activeView === 'withdrawal' ? (
          <WithdrawalPanel />
        ) : (
          <CheckoutPanel />
        )}

      </div>
    </main>
  )
}