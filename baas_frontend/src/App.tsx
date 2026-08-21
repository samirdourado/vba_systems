import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { DashboardPage } from "./pages/Dashboard";
import { RegisterSuccessPage } from "./pages/RegisterSuccess";
import { ForgotPasswordPage } from "./pages/ForgotPassword";

function App() {
  type View =
    | "home"
    | "login"
    | "register"
    | "register-success"
    | "forgot-password";

  const { isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState<View>("home");

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#d1d5db]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#c084fc] border-r-transparent" />
          Carregando...
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    return <DashboardPage onBack={() => setView("home")} />;
  }

  switch (view) {
    case "login":
      return (
        <LoginPage
          onSwitchMode={() => setView("register")}
          onForgotPassword={() => setView("forgot-password")}
        />
      );
    case "register":
      return (
        <RegisterPage
          onSwitchMode={() => setView("login")}
          onSuccess={() => setView("register-success")}
        />
      );
    case "register-success":
      return <RegisterSuccessPage onGoToLogin={() => setView("login")} />;
    case "forgot-password":
      return <ForgotPasswordPage onBackToLogin={() => setView("login")} />;
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(170,59,255,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,189,89,0.18),transparent_28%),linear-gradient(135deg,#000000_0%,#000000_32%,#000000_100%)]">
      <section className="w-[min(1180px,calc(100%-32px))] px-5 pb-10 pt-7">
        <header className="mb-12 flex items-center justify-between gap-5 md:mb-14">
          <div className="flex items-center" aria-label="Logo do BAAS">
            <img
              src="/logo.webp"
              alt="Logo BAAS"
              className="h-12.5 w-62.5 object-contain"
            />
          </div>
        </header>

        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="max-w-145 text-left">
            <span className="inline-flex items-center rounded-full border border-[#a855f7]/50 bg-[#aa3bff]/10 px-3 py-2 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-[#c084fc]">
              Plataforma financeira moderna
            </span>
            <h1 className="mt-5 text-5xl font-bold leading-[0.96] tracking-[-0.06em] text-white md:text-6xl lg:text-[4.5rem]">
              Controle seu dinheiro com segurança e praticidade.
            </h1>
            <p className="mt-4 max-w-130 text-base leading-7 text-[#9ca3af] md:text-lg">
              Acesse sua conta, acompanhe movimentações e aproveite uma
              experiência simples para pagar, receber e gerenciar seus recursos
              em um só lugar.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setView("login")}
                className="rounded-xl bg-linear-to-r from-[#aa3bff] to-[#8b5cf6] px-6 py-3 text-base font-bold text-white shadow-[0_14px_30px_rgba(170,59,255,0.25)] transition-transform hover:-translate-y-0.5"
              >
                Fazer login
              </button>
              <button
                type="button"
                onClick={() => setView("register")}
                className="rounded-xl border border-[#e5e4e7]/60 bg-transparent px-6 py-3 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Cadastrar
              </button>
            </div>

            <ul
              className="mt-8 flex list-none flex-wrap gap-5 p-0 text-sm text-[#9ca3af] md:text-base"
              aria-label="Benefícios"
            >
              <li className="relative pl-5 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-[#aa3bff] before:shadow-[0_0_0_4px_rgba(170,59,255,0.1)]">
                Transferências rápidas
              </li>
              <li className="relative pl-5 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-[#aa3bff] before:shadow-[0_0_0_4px_rgba(170,59,255,0.1)]">
                Segurança em cada operação
              </li>
              <li className="relative pl-5 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-[#aa3bff] before:shadow-[0_0_0_4px_rgba(170,59,255,0.1)]">
                Atendimento 24/7
              </li>
            </ul>
          </div>

          <div
            className="relative flex min-h-105 items-center justify-center lg:min-h-125"
            aria-label="Preview do painel da plataforma"
          >
            <div className="relative w-full max-w-125 rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-6">
              <div className="mb-6 flex gap-2">
                <span className="h-3 w-3 rounded-full bg-[#a855f7]"></span>
                <span className="h-3 w-3 rounded-full bg-[#fbbf24]"></span>
                <span className="h-3 w-3 rounded-full bg-[#34d399]"></span>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4 md:p-5">
                <span className="mb-3 block text-xs text-[#cbd5e1]">
                  Saldo disponível
                </span>
                <strong className="block text-3xl font-bold tracking-[-0.04em] text-white md:text-[2.4rem]">
                  R$ 24.680,00
                </strong>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <small className="mb-2 block text-xs text-[#cbd5e1]">
                    Entradas
                  </small>
                  <strong className="text-lg font-bold text-white">
                    R$ 8.940
                  </strong>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <small className="mb-2 block text-xs text-[#cbd5e1]">
                    Saídas
                  </small>
                  <strong className="text-lg font-bold text-white">
                    R$ 3.450
                  </strong>
                </div>
              </div>
            </div>

            <div className="absolute -right-3 top-15.5 min-w-40 rounded-[18px] border border-white/10 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)] md:-right-2">
              <span className="mb-1 block text-[0.72rem] text-[#6b6375]">
                Pagamentos
              </span>
              <strong className="text-lg font-bold text-[#111111]">
                +18,4%
              </strong>
            </div>

            <div className="absolute bottom-13 right-1.5 min-w-40 rounded-[18px] border border-white/10 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)] md:right-4.5">
              <span className="mb-1 block text-[0.72rem] text-[#6b6375]">
                Investimentos
              </span>
              <strong className="text-lg font-bold text-[#111111]">
                R$ 12.900
              </strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
