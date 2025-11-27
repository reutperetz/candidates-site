function Footer() {
  return (
    <footer style={{
      backgroundColor: "#455a64",
      color: '#ecf0f1',
      padding: '30px 20px',
      marginTop: '50px',
      borderTop: '1px solid #34495e',
      textAlign: 'center' as const,
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <p style={{
          margin: '0 0 10px 0',
          fontSize: '1em',
          fontWeight: '500',
        }}>
          Created by Reut Peretz & Agam Hulio
        </p>
        <p style={{
          margin: '0',
          fontSize: '0.9em',
          opacity: 0.8,
        }}>
          © 2025 Ono Academic College
        </p>
      </div>
    </footer>
  );
}

export default Footer;