export function RegisterSuccessPage({ onGoToLogin }: { onGoToLogin: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(170,59,255,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,189,89,0.14),transparent_22%),linear-gradient(135deg,#000000_0%,#0f172a_35%,#020617_100%)] px-4 py-10 text-white">
      <section className="w-full max-w-xl rounded-[30px] border border-emerald-500/30 bg-white/5 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-300">
            ✓
          </div>
        </div>

        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          Cadastro concluído
        </p>

        <h1 className="mt-3 text-center text-3xl font-bold text-white sm:text-4xl">
          Seu cadastro foi realizado com sucesso!
        </h1>

        <p className="mt-5 text-center text-base leading-7 text-[#d1d5db]">
          Os dados de acesso do gateway foram enviados para o seu e-mail. Confira sua caixa de entrada e siga as instruções para continuar.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/15 p-4 text-center text-sm text-[#e2e8f0]">
          <span className="font-medium text-white">Entendi,</span> já recebi o e-mail.
        </div>

        <div className="mt-8 text-center">
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onGoToLogin()
            }}
            className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#aa3bff] to-[#8b5cf6] px-5 py-3 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Ir para login
          </a>
        </div>
      </section>
    </main>
  )
}
