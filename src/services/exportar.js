import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── EXCEL ────────────────────────────────────────────────

export const exportarExcel = {

  reservas: (reservas, nombreNegocio = 'Reservly') => {
    const datos = reservas.map(r => ({
      'Cliente':    r.clientes?.nombre || '—',
      'Servicio':   r.servicios?.nombre || '—',
      'Empleado':   r.empleados?.nombre || '—',
      'Fecha':      r.fecha,
      'Hora':       r.hora_inicio?.slice(0,5) || '—',
      'Estado':     r.estado,
      'Precio':     r.servicios?.precio || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas');
    XLSX.writeFile(wb, `${nombreNegocio}_reservas_${hoy()}.xlsx`);
  },

  clientes: (clientes, nombreNegocio = 'Reservly') => {
    const datos = clientes.map(c => ({
      'Nombre':           c.nombre,
      'Teléfono':         c.telefono || '—',
      'Email':            c.email || '—',
      'Etiqueta':         c.tag,
      'Sexo':             c.sexo || '—',
      'Fecha nacimiento': c.fecha_nacimiento || '—',
      'Cliente desde':    new Date(c.created_at).toLocaleDateString('es-ES'),
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    XLSX.writeFile(wb, `${nombreNegocio}_clientes_${hoy()}.xlsx`);
  },

  stock: (productos, nombreNegocio = 'Reservly') => {
    const datos = productos.map(p => ({
      'Nombre':        p.nombre,
      'Código barras': p.codigo_barras || '—',
      'Categoría':     p.categoria || '—',
      'Stock actual':  p.stock_actual,
      'Stock mínimo':  p.stock_minimo,
      'Precio venta':  p.precio_venta || 0,
      'Precio coste':  p.precio_coste || 0,
      'Valor stock':   ((p.precio_coste || 0) * p.stock_actual).toFixed(2),
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock');
    XLSX.writeFile(wb, `${nombreNegocio}_stock_${hoy()}.xlsx`);
  },

  comisiones: (empleados, mes, nombreNegocio = 'Reservly') => {
    const datos = empleados.map(e => ({
      'Empleado':       e.nombre,
      'Tipo comisión':  e.tipo_comision,
      'Valor':          e.comision_valor,
      'Citas':          e.citas,
      'Facturado':      e.facturado.toFixed(2),
      'Comisión':       e.comision.toFixed(2),
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comisiones');
    XLSX.writeFile(wb, `${nombreNegocio}_comisiones_${mes}.xlsx`);
  },
};

// ── PDF ──────────────────────────────────────────────────

export const exportarPDF = {

  reservas: (reservas, nombreNegocio = 'Reservly') => {
    const doc = new jsPDF();
    cabecera(doc, nombreNegocio, 'Informe de reservas');

    autoTable(doc, {
      startY: 45,
      head: [['Cliente','Servicio','Empleado','Fecha','Hora','Estado','EUR']],
      body: reservas.map(r => [
        r.clientes?.nombre || '—',
        r.servicios?.nombre || '—',
        r.empleados?.nombre || '—',
        r.fecha,
        r.hora_inicio?.slice(0,5) || '—',
        r.estado,
        r.servicios?.precio || 0,
      ]),
      styles:     { fontSize:9, cellPadding:4 },
      headStyles: { fillColor:[10,158,110], textColor:255, fontStyle:'bold' },
      alternateRowStyles: { fillColor:[244,250,247] },
    });

    pie(doc, nombreNegocio);
    doc.save(`${nombreNegocio}_reservas_${hoy()}.pdf`);
  },

  clientes: (clientes, nombreNegocio = 'Reservly') => {
    const doc = new jsPDF();
    cabecera(doc, nombreNegocio, 'Informe de clientes');

    autoTable(doc, {
      startY: 45,
      head: [['Nombre','Teléfono','Email','Etiqueta','Sexo','Edad']],
      body: clientes.map(c => {
        const edad = c.fecha_nacimiento ? calcularEdad(c.fecha_nacimiento) : '—';
        return [
          c.nombre,
          c.telefono || '—',
          c.email || '—',
          c.tag,
          c.sexo || '—',
          edad !== null ? `${edad} años` : '—',
        ];
      }),
      styles:     { fontSize:9, cellPadding:4 },
      headStyles: { fillColor:[10,158,110], textColor:255, fontStyle:'bold' },
      alternateRowStyles: { fillColor:[244,250,247] },
    });

    pie(doc, nombreNegocio);
    doc.save(`${nombreNegocio}_clientes_${hoy()}.pdf`);
  },

  stock: (productos, nombreNegocio = 'Reservly') => {
    const doc = new jsPDF();
    cabecera(doc, nombreNegocio, 'Informe de stock');

    const valorTotal = productos.reduce((a,p) => a + (p.precio_coste||0)*p.stock_actual, 0);

    autoTable(doc, {
      startY: 45,
      head: [['Producto','Código','Categoría','Stock','Mín.','P.Venta','P.Coste','Valor']],
      body: productos.map(p => [
        p.nombre,
        p.codigo_barras || '—',
        p.categoria || '—',
        p.stock_actual,
        p.stock_minimo,
        p.precio_venta ? `${p.precio_venta} EUR` : '—',
        p.precio_coste ? `${p.precio_coste} EUR` : '—',
        `${((p.precio_coste||0)*p.stock_actual).toFixed(2)} EUR`,
      ]),
      styles:     { fontSize:8, cellPadding:3 },
      headStyles: { fillColor:[10,158,110], textColor:255, fontStyle:'bold' },
      alternateRowStyles: { fillColor:[244,250,247] },
      foot: [['','','','','','','Total:', `${valorTotal.toFixed(2)} EUR`]],
      footStyles: { fillColor:[6,61,42], textColor:255, fontStyle:'bold' },
    });

    pie(doc, nombreNegocio);
    doc.save(`${nombreNegocio}_stock_${hoy()}.pdf`);
  },
};

// ── Helpers ──────────────────────────────────────────────

const hoy = () => new Date().toISOString().split('T')[0];

const calcularEdad = (fechaNacimiento) => {
  const hoyD = new Date();
  const nac  = new Date(fechaNacimiento);
  let edad = hoyD.getFullYear() - nac.getFullYear();
  if (hoyD.getMonth() - nac.getMonth() < 0 ||
     (hoyD.getMonth() - nac.getMonth() === 0 && hoyD.getDate() < nac.getDate())) edad--;
  return edad;
};

const cabecera = (doc, negocio, titulo) => {
  doc.setFillColor(6, 61, 42);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(18);
  doc.setFont('helvetica','bold');
  doc.text('Reservly', 14, 14);
  doc.setFontSize(11);
  doc.setFont('helvetica','normal');
  doc.text(negocio, 14, 22);
  doc.setTextColor(10,158,110);
  doc.text(titulo, 14, 35);
  doc.setTextColor(150,150,150);
  doc.setFontSize(9);
  doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, 210-14, 35, { align:'right' });
};

const pie = (doc, negocio) => {
  const paginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180,180,180);
    doc.text(`${negocio} · Reservly · Página ${i} de ${paginas}`, 105, 290, { align:'center' });
  }
};