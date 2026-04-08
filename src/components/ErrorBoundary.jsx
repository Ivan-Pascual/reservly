import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, padding:40, minHeight:'100vh', background:'#F4FAF7' }}>
          <div style={{ fontSize:48 }}>⚠️</div>
          <div style={{ fontSize:20, fontWeight:700, color:'#0B1E16' }}>Algo ha ido mal</div>
          <div style={{ fontSize:13, color:'#6B9080', maxWidth:360, textAlign:'center', lineHeight:1.6 }}>
            Ha ocurrido un error inesperado. Por favor recarga la página o vuelve al inicio.
          </div>
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <button onClick={() => window.location.reload()}
              style={{ background:'transparent', border:'1px solid #D6EDE5', color:'#6B9080', padding:'9px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Recargar página
            </button>
            <button onClick={() => window.location.href = '/dashboard'}
              style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'9px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Volver al inicio
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop:20, background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'12px 16px', maxWidth:500, fontSize:12, fontFamily:'DM Mono, monospace', color:'#EF4444', wordBreak:'break-all' }}>
              {this.state.error?.toString()}
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}