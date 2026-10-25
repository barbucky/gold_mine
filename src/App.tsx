function App() {
  return (
    <main
      style={{
        minHeight: '100%',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: '24px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-classic)',
            fontWeight: 500,
            letterSpacing: '0.08em',
            color: 'var(--brass-hi)',
            fontSize: 'clamp(22px, 6vw, 32px)',
            margin: 0,
          }}
        >
          Mc&rsquo;s Gold Mine
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '12px' }}>
          Étape 0 — fondations posées. La coquille (ascenseur, étages) arrive à l&rsquo;étape 1.
        </p>
      </div>
    </main>
  )
}

export default App
