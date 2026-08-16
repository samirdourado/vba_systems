import './App.css'

function App() {
  return (
    <main className="home-shell">
      <section className="home-container">
        <header className="topbar">
          <div className="brand" aria-label="Logo do BAAS">
            <img src="/logo.webp" alt="Logo BAAS" className="brand-logo" />
          </div>

          <nav className="nav" aria-label="Navegação principal">
            <a href="#sobre">Sobre</a>
            <a href="#recursos">Recursos</a>
            <a href="#contato">Contato</a>
          </nav>
        </header>

        <div className="hero-content">
          <div className="hero-copy">
            <span className="eyebrow">Plataforma financeira moderna</span>
            <h1>Controle seu dinheiro com segurança e praticidade.</h1>
            <p>
              Acesse sua conta, acompanhe movimentações e aproveite uma experiência
              simples para pagar, receber e gerenciar seus recursos em um só lugar.
            </p>

            <div className="actions">
              <button type="button" className="primary-btn">
                Fazer login
              </button>
              <button type="button" className="secondary-btn">
                Cadastrar
              </button>
            </div>

            <ul className="highlights" aria-label="Benefícios">
              <li>Transferências rápidas</li>
              <li>Segurança em cada operação</li>
              <li>Atendimento 24/7</li>
            </ul>
          </div>

          <div className="hero-visual" aria-label="Preview do painel da plataforma">
            <div className="panel-card main-panel">
              <div className="panel-header">
                <span className="dot dot-purple"></span>
                <span className="dot dot-gold"></span>
                <span className="dot dot-green"></span>
              </div>

              <div className="balance-box">
                <span>Saldo disponível</span>
                <strong>R$ 24.680,00</strong>
              </div>

              <div className="metrics-grid">
                <div className="metric-item">
                  <small>Entradas</small>
                  <strong>R$ 8.940</strong>
                </div>
                <div className="metric-item">
                  <small>Saídas</small>
                  <strong>R$ 3.450</strong>
                </div>
              </div>
            </div>

            <div className="mini-card mini-card-top">
              <span>Pagamentos</span>
              <strong>+18,4%</strong>
            </div>

            <div className="mini-card mini-card-bottom">
              <span>Investimentos</span>
              <strong>R$ 12.900</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
