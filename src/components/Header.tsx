function Header() {
  return (
    <header style={{
      background: "linear-gradient(135deg, #33691e 0%, #607d8b 100%)",
      color: 'white',
      padding: '40px 20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '30px',
      textAlign: 'center' as const,
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <h1 style={{
          margin: '0',
          fontSize: '2.5em',
          fontWeight: '700',
          letterSpacing: '0.5px',
        }}>
          Ono Academic College
        </h1>
        <h2 style={{
          margin: '10px 0 0 0',
          fontSize: '1.2em',
          fontWeight: '300',
          opacity: 0.95,
        }}>
          Computer Science Department – Candidates Site
        </h2>
      </div>
    </header>
  );
}

export default Header;