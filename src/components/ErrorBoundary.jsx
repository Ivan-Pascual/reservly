import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ minHeight:'100vh', background:'#F4FAF7', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'DM Sans, system-ui, sans-serif' }}>
        <div style={{ maxWidth:460, width:'100%', textAlign:'center' }}>
          <div style={{ fontSize:64, marginBottom:16 }}>⚠️</div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0B1E16', marginBottom:10 }}>
            Algo ha ido mal
          </h1>
          <p style={{ fontSize:14, color:'#6B9080', lineHeight:1.7, marginBottom:28 }}>
            Ha ocurrido un error inesperado. Prueba a recargar la página. Si el problema persiste, escríbenos a{' '}
            <a href="mailto:hola@getreservly.com" style={{ color:'#0A9E6E', fontWeight:600 }}>hola@getreservly.com</a>
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => window.location.reload()}
              style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'12px 24px', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>
              Recargar página
            </button>
            <button onClick={() => { this.setState({ hasError:false, error:null }); window.location.href = '/dashboard'; }}
              style={{ background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', padding:'12px 24px', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>
              Ir al inicio
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div style={{ marginTop:24, background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'14px 16px', textAlign:'left' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#EF4444', textTransform:'uppercase', marginBottom:6 }}>Error (solo en desarrollo)</div>
              <pre style={{ fontSize:11, color:'#EF4444', whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0 }}>
                {this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }
}