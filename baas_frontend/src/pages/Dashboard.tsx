import { LogOut, ArrowUpRight, Wallet, CreditCard, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function DashboardPage({ onBack }: { onBack: () => void }) {
  const { user, logout } = useAuth()

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

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#cbd5e1]">Saldo</span>
              <Wallet className="text-[#c084fc]" size={18} />
            </div>
            <p className="text-3xl font-bold text-white">R$ 24.680,00</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#cbd5e1]">Pagamentos</span>
              <CreditCard className="text-[#34d399]" size={18} />
            </div>
            <p className="text-3xl font-bold text-white">R$ 8.940</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#cbd5e1]">Crescimento</span>
              <TrendingUp className="text-[#fbbf24]" size={18} />
            </div>
            <p className="text-3xl font-bold text-white">+18,4%</p>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[#cbd5e1]">Resumo da conta</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Operações recentes</h2>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-[#aa3bff] to-[#8b5cf6] px-4 py-2 font-semibold text-white"
            >
              Ver detalhes
              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
