import { useState, useEffect } from 'react';
import { useNegocio } from './useNegocio';

const FEATURES = {
  trial: {
    empleados:      Infinity,
    tpv:            true,
    stock:          true,
    googleCalendar: true,
    estadisticas:   true,
    whatsapp:       true,
    fidelizacion:   true,
    widget:         true,
    resenas:        true,
    formularios:    true,
    comisiones:     true,
    bonos:          true,
    exportar:       true,
    multiSede:      true,
    facturaElect:   true,
  },
  // 'solo' es el plan de lanzamiento — equivale a Pro completo
  solo: {
    empleados:      Infinity,
    tpv:            true,
    stock:          true,
    googleCalendar: true,
    estadisticas:   true,
    whatsapp:       true,
    fidelizacion:   true,
    widget:         true,
    resenas:        true,
    formularios:    true,
    comisiones:     true,
    bonos:          true,
    exportar:       true,
    multiSede:      false,
    facturaElect:   false,
  },
  basico: {
    empleados:      2,
    tpv:            true,
    stock:          true,
    googleCalendar: true,
    estadisticas:   true,
    whatsapp:       false,
    fidelizacion:   false,
    widget:         false,
    resenas:        false,
    formularios:    false,
    comisiones:     false,
    bonos:          false,
    exportar:       false,
    multiSede:      false,
    facturaElect:   false,
  },
  pro: {
    empleados:      Infinity,
    tpv:            true,
    stock:          true,
    googleCalendar: true,
    estadisticas:   true,
    whatsapp:       true,
    fidelizacion:   true,
    widget:         true,
    resenas:        true,
    formularios:    true,
    comisiones:     true,
    bonos:          true,
    exportar:       true,
    multiSede:      false,
    facturaElect:   false,
  },
  agencia: {
    empleados:      Infinity,
    tpv:            true,
    stock:          true,
    googleCalendar: true,
    estadisticas:   true,
    whatsapp:       true,
    fidelizacion:   true,
    widget:         true,
    resenas:        true,
    formularios:    true,
    comisiones:     true,
    bonos:          true,
    exportar:       true,
    multiSede:      true,
    facturaElect:   true,
  },
};

export function usePlan() {
  const { negocio } = useNegocio();
  const [planActivo, setPlanActivo] = useState('trial');
  const [trialExpirado, setTrialExpirado] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState(30);

  useEffect(() => {
    if (!negocio) return;

    const plan = negocio.plan || 'trial';
    const expiry = negocio.plan_expiry ? new Date(negocio.plan_expiry) : null;
    const ahora = new Date();

    if (plan === 'trial') {
      if (expiry && ahora > expiry) {
        setTrialExpirado(true);
        setPlanActivo('trial_expirado');
      } else {
        const dias = expiry
          ? Math.max(0, Math.ceil((expiry - ahora) / (1000 * 60 * 60 * 24)))
          : 30;
        setDiasRestantes(dias);
        setPlanActivo('trial');
      }
    } else {
      setPlanActivo(plan);
      setTrialExpirado(false);
    }
  }, [negocio]);

  const puede = (feature) => {
    if (trialExpirado) return false;
    const features = FEATURES[planActivo] || FEATURES.basico;
    return !!features[feature];
  };

  const limiteEmpleados = () => {
    if (trialExpirado) return 0;
    const features = FEATURES[planActivo] || FEATURES.basico;
    return features.empleados;
  };

  const esPlan = (plan) => planActivo === plan;
  const esTrial   = planActivo === 'trial';
  const esBasico  = planActivo === 'basico';
  const esSolo    = planActivo === 'solo';
  const esPro     = planActivo === 'pro';
  const esAgencia = planActivo === 'agencia';

  return {
    plan: planActivo,
    trialExpirado,
    diasRestantes,
    puede,
    limiteEmpleados,
    esTrial,
    esBasico,
    esSolo,
    esPro,
    esAgencia,
  };
}