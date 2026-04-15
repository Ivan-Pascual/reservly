import React, { useEffect, useState } from 'react';
import { useNegocio } from '../../hooks/useNegocio';

export default function QRImprimible() {
  const { negocio } = useNegocio();
  const [qrUrl, setQrUrl] = useState('');
  const [estilo, setEstilo] = useState('verde');

  const urlReserva = `https://getreservly.com/reservar/${negocio?.slug || ''}`;

  useEffect(() => {
    if (!negocio?.slug) return;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(urlReserva)}&bgcolor=ffffff&color=063D2A&margin=10`;
    setQrUrl(url);
  }, [negocio, urlReserva]);

  const imprimir = () => window.print();

  const descargarPNG = async () => {
    if (!qrUrl) return;
    const res = await fetch(qrUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-reserva-${negocio?.slug || 'negocio'}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const estilos = {
    verde:  { bg:'#063D2A', texto:'#fff',    acento:'#0A9E6E' },
    blanco: { bg:'#fff',    texto:'#063D2A', acento:'#0A9E6E' },
    negro:  { bg:'#0B1E16', texto:'#fff',    acento:'#7FFFD4' },
  };

  const e = estilos[estilo];

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, fontFamily:'DM Sans, system-ui, sans-serif' }}>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area {
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          body { margin: 0; }
        }
      `}</style>

      {/* Topbar */}
      <div className="no-print" style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 32px', height:60, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>QR de reserva</div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button onClick={descargarPNG}
            style={{ background:'#F4FAF7', color:'#063D2A', border:'1px solid #D6EDE5', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            ⬇️ Descargar PNG
          </button>
          <button onClick={imprimir}
            style={{ background:'#063D2A', color:'#fff', border:'none', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
            🖨️ Imprimir / PDF
          </button>
        </div>
      </div>

      <div style={{ padding:32, display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>

        {/* Controles */}
        <div className="no-print">
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:24, marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:16 }}>Estilo del cartel</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { key:'verde',  label:'Verde oscuro', desc:'Fondo verde · Texto blanco' },
                { key:'blanco', label:'Blanco',       desc:'Fondo blanco · Texto verde' },
                { key:'negro',  label:'Negro',        desc:'Fondo negro · Texto menta'  },
              ].map(o => (
                <label key={o.key} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', border:`1.5px solid ${estilo===o.key ? '#0A9E6E' : '#D6EDE5'}`, borderRadius:8, cursor:'pointer', background: estilo===o.key ? '#E8F7F2' : '#F4FAF7' }}>
                  <input type="radio" checked={estilo===o.key} onChange={() => setEstilo(o.key)} style={{ accentColor:'#0A9E6E' }}/>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{o.label}</div>
                    <div style={{ fontSize:11.5, color:'#6B9080' }}>{o.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:24 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:8 }}>URL de reserva</div>
            <div style={{ padding:'10px 12px', background:'#F4FAF7', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:12, fontFamily:'DM Mono, monospace', color:'#6B9080', wordBreak:'break-all' }}>
              {urlReserva}
            </div>
            <div style={{ fontSize:12, color:'#A8C4B8', marginTop:8, lineHeight:1.6 }}>
              Cuando alguien escanea el QR va directamente a tu página de reservas. Sin apps, sin registro.
            </div>
          </div>
        </div>

        {/* Preview del cartel */}
        <div>
          <div className="no-print" style={{ fontSize:12, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>
            Vista previa
          </div>
          <div className="print-area">
            <div style={{
              background: e.bg,
              borderRadius:20,
              padding:'40px 32px',
              textAlign:'center',
              width:320,
              boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
            }}>
              {/* Logo */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:28 }}>
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                  <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
                    stroke={e.texto} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="21" cy="32" r="4.5" fill={e.texto}/>
                  <circle cx="21" cy="32" r="2.2" fill={e.bg}/>
                </svg>
                <span style={{ fontSize:18, fontWeight:800, color:e.texto, letterSpacing:-0.3 }}>Reservly</span>
              </div>

              {/* Nombre negocio */}
              <div style={{ fontSize:22, fontWeight:800, color:e.texto, marginBottom:6, letterSpacing:-0.3 }}>
                {negocio?.nombre || 'Tu negocio'}
              </div>
              <div style={{ fontSize:13, color: estilo==='verde' ? 'rgba(255,255,255,0.6)' : estilo==='negro' ? 'rgba(255,255,255,0.5)' : '#6B9080', marginBottom:28 }}>
                Reserva tu cita en segundos
              </div>

              {/* QR */}
              <div style={{ background:'#fff', borderRadius:16, padding:16, display:'inline-block', marginBottom:24, boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
                {qrUrl ? (
                  <img src={qrUrl} alt="QR reserva" width={180} height={180} style={{ display:'block' }}/>
                ) : (
                  <div style={{ width:180, height:180, background:'#F4FAF7', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#A8C4B8' }}>
                    Cargando QR...
                  </div>
                )}
              </div>

              {/* URL corta */}
              <div style={{ background: estilo==='blanco' ? '#F4FAF7' : 'rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 14px', display:'inline-block' }}>
                <span style={{ fontSize:11, fontFamily:'DM Mono, monospace', color: estilo==='blanco' ? '#6B9080' : 'rgba(255,255,255,0.6)' }}>
                  getreservly.com/reservar/{negocio?.slug || ''}
                </span>
              </div>

              {/* Sin app */}
              <div style={{ marginTop:20, fontSize:11, color: estilo==='blanco' ? '#A8C4B8' : 'rgba(255,255,255,0.4)' }}>
                Sin descargas · Sin registro
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}