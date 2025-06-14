// Fonction d'erreur complémentaire pour le calcul de N(d)
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

// Distribution normale cumulative N(x)
function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

// Fonction de densité normale
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Garman-Kohlhagen model for vanilla FX options
export function garmanKohlhagenPrice(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  domesticRate: number,
  foreignRate: number,
  volatility: number,
  isCall: boolean
): number {
  if (timeToExpiry <= 0) {
    return Math.max(0, isCall ? spotPrice - strikePrice : strikePrice - spotPrice);
  }

  const d1 = (Math.log(spotPrice / strikePrice) + (domesticRate - foreignRate + 0.5 * volatility * volatility) * timeToExpiry) / 
             (volatility * Math.sqrt(timeToExpiry));
  const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

  if (isCall) {
    return spotPrice * Math.exp(-foreignRate * timeToExpiry) * normalCDF(d1) - 
           strikePrice * Math.exp(-domesticRate * timeToExpiry) * normalCDF(d2);
  } else {
    return strikePrice * Math.exp(-domesticRate * timeToExpiry) * normalCDF(-d2) - 
           spotPrice * Math.exp(-foreignRate * timeToExpiry) * normalCDF(-d1);
  }
}

// Greeks calculation for Garman-Kohlhagen
export function garmanKohlhagenDelta(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  domesticRate: number,
  foreignRate: number,
  volatility: number,
  isCall: boolean
): number {
  if (timeToExpiry <= 0) return 0;

  const d1 = (Math.log(spotPrice / strikePrice) + (domesticRate - foreignRate + 0.5 * volatility * volatility) * timeToExpiry) / 
             (volatility * Math.sqrt(timeToExpiry));

  const delta = Math.exp(-foreignRate * timeToExpiry) * normalCDF(isCall ? d1 : -d1);
  return isCall ? delta : delta - Math.exp(-foreignRate * timeToExpiry);
}

export function garmanKohlhagenGamma(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  domesticRate: number,
  foreignRate: number,
  volatility: number
): number {
  if (timeToExpiry <= 0) return 0;

  const d1 = (Math.log(spotPrice / strikePrice) + (domesticRate - foreignRate + 0.5 * volatility * volatility) * timeToExpiry) / 
             (volatility * Math.sqrt(timeToExpiry));

  return Math.exp(-foreignRate * timeToExpiry) * normalPDF(d1) / (spotPrice * volatility * Math.sqrt(timeToExpiry));
}

export function garmanKohlhagenVega(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  domesticRate: number,
  foreignRate: number,
  volatility: number
): number {
  if (timeToExpiry <= 0) return 0;

  const d1 = (Math.log(spotPrice / strikePrice) + (domesticRate - foreignRate + 0.5 * volatility * volatility) * timeToExpiry) / 
             (volatility * Math.sqrt(timeToExpiry));

  return spotPrice * Math.exp(-foreignRate * timeToExpiry) * normalPDF(d1) * Math.sqrt(timeToExpiry) / 100;
}

export function garmanKohlhagenTheta(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  domesticRate: number,
  foreignRate: number,
  volatility: number,
  isCall: boolean
): number {
  if (timeToExpiry <= 0) return 0;

  const d1 = (Math.log(spotPrice / strikePrice) + (domesticRate - foreignRate + 0.5 * volatility * volatility) * timeToExpiry) / 
             (volatility * Math.sqrt(timeToExpiry));
  const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

  const term1 = -spotPrice * Math.exp(-foreignRate * timeToExpiry) * normalPDF(d1) * volatility / (2 * Math.sqrt(timeToExpiry));
  
  if (isCall) {
    const term2 = foreignRate * spotPrice * Math.exp(-foreignRate * timeToExpiry) * normalCDF(d1);
    const term3 = -domesticRate * strikePrice * Math.exp(-domesticRate * timeToExpiry) * normalCDF(d2);
    return (term1 + term2 + term3) / 365;
  } else {
    const term2 = -foreignRate * spotPrice * Math.exp(-foreignRate * timeToExpiry) * normalCDF(-d1);
    const term3 = domesticRate * strikePrice * Math.exp(-domesticRate * timeToExpiry) * normalCDF(-d2);
    return (term1 + term2 + term3) / 365;
  }
}

// Options à barrière - formule analytique Garman-Kohlhagen modifiée
export function barrierOptionPrice(
  spotPrice: number,
  strikePrice: number,
  barrier: number,
  timeToExpiry: number,
  domesticRate: number,
  foreignRate: number,
  volatility: number,
  isCall: boolean,
  isKnockOut: boolean,
  rebate: number = 0
): number {
  if (timeToExpiry <= 0) {
    const barrierTouched = isCall ? (spotPrice <= barrier) : (spotPrice >= barrier);
    
    if (isKnockOut && barrierTouched) {
      return rebate;
    } else if (!isKnockOut && !barrierTouched) {
      return rebate;
    } else {
      return Math.max(0, isCall ? spotPrice - strikePrice : strikePrice - spotPrice);
    }
  }

  const mu = domesticRate - foreignRate - 0.5 * volatility * volatility;
  const lambda = (mu + 0.5 * volatility * volatility) / (volatility * volatility);
  
  const x1 = Math.log(spotPrice / strikePrice) / (volatility * Math.sqrt(timeToExpiry)) + 
            lambda * volatility * Math.sqrt(timeToExpiry);
  const y1 = Math.log(barrier / spotPrice) / (volatility * Math.sqrt(timeToExpiry)) + 
            lambda * volatility * Math.sqrt(timeToExpiry);
  const y = Math.log(barrier * barrier / (spotPrice * strikePrice)) / (volatility * Math.sqrt(timeToExpiry)) + 
           lambda * volatility * Math.sqrt(timeToExpiry);

  // Prix vanilla de référence
  const vanillaPrice = garmanKohlhagenPrice(spotPrice, strikePrice, timeToExpiry, domesticRate, foreignRate, volatility, isCall);
  
  let barrierPrice = 0;
  
  if (isCall) {
    if (barrier <= strikePrice) {
      // Down-and-out call
      const A = spotPrice * Math.exp(-foreignRate * timeToExpiry) * normalCDF(x1) - 
               strikePrice * Math.exp(-domesticRate * timeToExpiry) * normalCDF(x1 - volatility * Math.sqrt(timeToExpiry));
      const B = spotPrice * Math.exp(-foreignRate * timeToExpiry) * normalCDF(y1) - 
               strikePrice * Math.exp(-domesticRate * timeToExpiry) * normalCDF(y1 - volatility * Math.sqrt(timeToExpiry));
      const C = spotPrice * Math.exp(-foreignRate * timeToExpiry) * Math.pow(barrier / spotPrice, 2 * lambda) * normalCDF(y) - 
               strikePrice * Math.exp(-domesticRate * timeToExpiry) * Math.pow(barrier / spotPrice, 2 * lambda - 2) * 
               normalCDF(y - volatility * Math.sqrt(timeToExpiry));

      if (isKnockOut) {
        barrierPrice = A - B - C;
      } else {
        barrierPrice = B + C;
      }
    } else {
      // Up-and-out call (barrière au-dessus du strike)
      if (isKnockOut && spotPrice >= barrier) {
        barrierPrice = 0; // Déjà knocké
      } else if (isKnockOut) {
        barrierPrice = vanillaPrice; // Approximation pour up-and-out
      } else {
        barrierPrice = vanillaPrice; // Knock-in pas encore activé
      }
    }
  } else {
    if (barrier >= strikePrice) {
      // Up-and-out put
      const A = -spotPrice * Math.exp(-foreignRate * timeToExpiry) * normalCDF(-x1) + 
               strikePrice * Math.exp(-domesticRate * timeToExpiry) * normalCDF(-x1 + volatility * Math.sqrt(timeToExpiry));
      const B = -spotPrice * Math.exp(-foreignRate * timeToExpiry) * normalCDF(-y1) + 
               strikePrice * Math.exp(-domesticRate * timeToExpiry) * normalCDF(-y1 + volatility * Math.sqrt(timeToExpiry));
      const C = -spotPrice * Math.exp(-foreignRate * timeToExpiry) * Math.pow(barrier / spotPrice, 2 * lambda) * normalCDF(-y) + 
               strikePrice * Math.exp(-domesticRate * timeToExpiry) * Math.pow(barrier / spotPrice, 2 * lambda - 2) * 
               normalCDF(-y + volatility * Math.sqrt(timeToExpiry));

      if (isKnockOut) {
        barrierPrice = A - B - C;
      } else {
        barrierPrice = B + C;
      }
    } else {
      // Down-and-out put (barrière en-dessous du strike)
      if (isKnockOut && spotPrice <= barrier) {
        barrierPrice = 0; // Déjà knocké
      } else if (isKnockOut) {
        barrierPrice = vanillaPrice; // Approximation pour down-and-out
      } else {
        barrierPrice = vanillaPrice; // Knock-in pas encore activé
      }
    }
  }

  return Math.max(0, barrierPrice + rebate * Math.exp(-domesticRate * timeToExpiry));
}

// Monte Carlo pour options digitales
export function monteCarloDigitalOption(
  spotPrice: number,
  lowerBarrier: number,
  upperBarrier: number,
  timeToExpiry: number,
  domesticRate: number,
  foreignRate: number,
  volatility: number,
  payout: number,
  isRange: boolean,
  numSimulations: number = 50000
): number {
  if (timeToExpiry <= 0) {
    const isInRange = spotPrice > lowerBarrier && spotPrice < upperBarrier;
    return isRange === isInRange ? payout * Math.exp(-domesticRate * timeToExpiry) : 0;
  }

  let payoffSum = 0;
  const numSteps = Math.max(25, Math.floor(timeToExpiry * 100)); // Moins d'étapes pour plus de rapidité
  const dt = timeToExpiry / numSteps;
  const drift = (domesticRate - foreignRate - 0.5 * volatility * volatility) * dt;
  const diffusion = volatility * Math.sqrt(dt);
  
  for (let i = 0; i < numSimulations; i++) {
    let currentSpot = spotPrice;
    let pathValid = true;
    
    for (let j = 0; j < numSteps && pathValid; j++) {
      const gaussianRandom = normalInverse();
      currentSpot *= Math.exp(drift + diffusion * gaussianRandom);
      
      if (isRange) {
        // Range binary : doit rester dans la plage
        if (currentSpot <= lowerBarrier || currentSpot >= upperBarrier) {
          pathValid = false;
        }
      } else {
        // Outside binary : doit toucher une barrière
        if (currentSpot <= lowerBarrier || currentSpot >= upperBarrier) {
          payoffSum += payout;
          pathValid = false;
        }
      }
    }
    
    if (isRange && pathValid) {
      payoffSum += payout;
    }
  }
  
  return (payoffSum / numSimulations) * Math.exp(-domesticRate * timeToExpiry);
}

// One Touch / No Touch options pricing
export function touchOptionPrice(
  spotPrice: number,
  barrier: number,
  timeToExpiry: number,
  domesticRate: number,
  foreignRate: number,
  volatility: number,
  payout: number,
  isOneTouch: boolean
): number {
  if (timeToExpiry <= 0) {
    const touched = (barrier > spotPrice && spotPrice >= barrier) || (barrier < spotPrice && spotPrice <= barrier);
    return (isOneTouch ? touched : !touched) ? payout * Math.exp(-domesticRate * timeToExpiry) : 0;
  }

  const mu = domesticRate - foreignRate - 0.5 * volatility * volatility;
  const lambda = Math.sqrt(mu * mu + 2 * domesticRate * volatility * volatility) / volatility;
  
  const x = Math.log(barrier / spotPrice) / (volatility * Math.sqrt(timeToExpiry));
  const y = Math.log(barrier / spotPrice) * lambda / volatility;
  
  let touchProb = 0;
  
  if (barrier > spotPrice) {
    // Barrière au-dessus
    touchProb = normalCDF(x + volatility * Math.sqrt(timeToExpiry)) + 
                Math.pow(barrier / spotPrice, 2 * lambda / volatility) * normalCDF(-x + lambda * Math.sqrt(timeToExpiry));
  } else {
    // Barrière en-dessous
    touchProb = normalCDF(-x - volatility * Math.sqrt(timeToExpiry)) + 
                Math.pow(barrier / spotPrice, 2 * lambda / volatility) * normalCDF(x - lambda * Math.sqrt(timeToExpiry));
  }
  
  const expectedValue = isOneTouch ? touchProb : (1 - touchProb);
  return expectedValue * payout * Math.exp(-domesticRate * timeToExpiry);
}

// Générateur de nombres gaussiens (Box-Muller)
function normalInverse(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Calculate theoretical price based on instrument type - VERSION CORRIGÉE
export function calculateTheoreticalPrice(
  instrument: any,
  marketData?: { 
    spotRates?: { [key: string]: number };
    volatilities?: { [key: string]: number };
    riskFreeRate?: number;
  }
): number {
  console.log('=== CALCUL PRIX THEORIQUE ===');
  console.log('Instrument:', instrument);
  console.log('Market Data:', marketData);

  const defaultRates = {
    EURUSD: 1.0856,
    EURGBP: 0.8434,
    EURJPY: 161.85,
    EURCHF: 0.9642
  };

  const currentRates = marketData?.spotRates || defaultRates;
  const spotRate = currentRates[`EUR${instrument.currency}`] || 1;
  
  // Calcul du temps à l'échéance en années
  const maturityDate = new Date(instrument.maturity);
  const currentDate = new Date();
  const timeToExpiry = Math.max(0, (maturityDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
  
  // Utilisation des paramètres spécifiques à l'instrument en priorité
  const volatility = instrument.impliedVolatility || marketData?.volatilities?.[`EUR${instrument.currency}`] || 0.15;
  const domesticRate = instrument.riskFreeRate || marketData?.riskFreeRate || 0.02;
  const foreignRate = 0.005; // Taux fixe pour devise étrangère
  
  // Calcul du strike effectif
  let effectiveStrike = instrument.rate;
  if (instrument.strikeType === 'percentage' && spotRate) {
    effectiveStrike = spotRate * (instrument.rate / 100);
  }

  console.log('Paramètres de calcul:', {
    spotRate,
    effectiveStrike,
    timeToExpiry,
    volatility,
    domesticRate,
    foreignRate,
    type: instrument.type
  });

  let theoreticalPrice = 0;

  switch (instrument.type) {
    case 'Forward':
      // Forward FX: (Spot - Strike) * e^(-r * T)
      theoreticalPrice = (spotRate - effectiveStrike) * Math.exp(-domesticRate * timeToExpiry);
      break;

    case 'Call':
      theoreticalPrice = garmanKohlhagenPrice(
        spotRate, effectiveStrike, timeToExpiry, domesticRate, foreignRate, volatility, true
      );
      break;

    case 'Put':
      theoreticalPrice = garmanKohlhagenPrice(
        spotRate, effectiveStrike, timeToExpiry, domesticRate, foreignRate, volatility, false
      );
      break;

    case 'Call Knock-Out':
    case 'Call Knock-In':
      if (instrument.barrier) {
        let effectiveBarrier = instrument.barrier;
        if (instrument.barrierType === 'percentage') {
          effectiveBarrier = spotRate * (instrument.barrier / 100);
        }
        const isKnockOut = instrument.type.includes('Knock-Out');
        theoreticalPrice = barrierOptionPrice(
          spotRate, effectiveStrike, effectiveBarrier, timeToExpiry,
          domesticRate, foreignRate, volatility, true, isKnockOut, instrument.rebate || 0
        );
      }
      break;

    case 'Put Knock-Out':
    case 'Put Knock-In':
      if (instrument.barrier) {
        let effectiveBarrier = instrument.barrier;
        if (instrument.barrierType === 'percentage') {
          effectiveBarrier = spotRate * (instrument.barrier / 100);
        }
        const isKnockOut = instrument.type.includes('Knock-Out');
        theoreticalPrice = barrierOptionPrice(
          spotRate, effectiveStrike, effectiveBarrier, timeToExpiry,
          domesticRate, foreignRate, volatility, false, isKnockOut, instrument.rebate || 0
        );
      }
      break;

    case 'Range Binary (beta)':
    case 'Outside Binary (beta)':
      if (instrument.lowerBarrier && instrument.upperBarrier) {
        let effectiveLowerBarrier = instrument.lowerBarrier;
        let effectiveUpperBarrier = instrument.upperBarrier;
        
        if (instrument.barrierType === 'percentage') {
          effectiveLowerBarrier = spotRate * (instrument.lowerBarrier / 100);
          effectiveUpperBarrier = spotRate * (instrument.upperBarrier / 100);
        }
        
        const isRange = instrument.type.includes('Range');
        const payout = 1; // Payout unitaire pour binary
        
        theoreticalPrice = monteCarloDigitalOption(
          spotRate, effectiveLowerBarrier, effectiveUpperBarrier, timeToExpiry,
          domesticRate, foreignRate, volatility, payout, isRange
        );
      }
      break;

    case 'One Touch (beta)':
    case 'No Touch (beta)':
      if (instrument.barrier) {
        let effectiveBarrier = instrument.barrier;
        if (instrument.barrierType === 'percentage') {
          effectiveBarrier = spotRate * (instrument.barrier / 100);
        }
        
        const isOneTouch = instrument.type.includes('One Touch');
        const payout = 1; // Payout unitaire
        
        theoreticalPrice = touchOptionPrice(
          spotRate, effectiveBarrier, timeToExpiry, domesticRate, foreignRate,
          volatility, payout, isOneTouch
        );
      }
      break;

    case 'Swap':
      // Currency swap approximation
      theoreticalPrice = (spotRate - effectiveStrike) * timeToExpiry * Math.exp(-domesticRate * timeToExpiry);
      break;

    default:
      console.warn('Type d\'instrument non reconnu:', instrument.type);
      theoreticalPrice = 0;
  }

  console.log('Prix théorique calculé:', theoreticalPrice);
  return theoreticalPrice;
}

// Calcul du MTM pour tous types d'instruments - VERSION CORRIGÉE
export function calculateMTM(
  instrument: any,
  marketData?: { 
    spotRates?: { [key: string]: number };
    volatilities?: { [key: string]: number };
    riskFreeRate?: number;
  }
): number {
  console.log('=== CALCUL MTM ===');
  
  const theoreticalPricePerUnit = calculateTheoreticalPrice(instrument, marketData);
  const notional = Math.abs(instrument.amount);
  const totalTheoreticalValue = theoreticalPricePerUnit * notional;
  const premiumPaid = instrument.premium || 0;
  
  let mtm = 0;
  
  // Pour différents types d'instruments
  if (instrument.type === 'Forward' || instrument.type === 'Swap') {
    // Pour forwards et swaps: MTM = valeur théorique totale
    mtm = totalTheoreticalValue;
  } else {
    // Pour toutes les options: MTM = valeur théorique - prime payée
    mtm = totalTheoreticalValue - premiumPaid;
  }
  
  // Ajustement pour la direction (long/short)
  if (instrument.amount < 0) {
    mtm = -mtm; // Position short
  }

  console.log('Calcul MTM:', {
    instrument: instrument.type,
    theoreticalPricePerUnit,
    notional,
    totalTheoreticalValue,
    premiumPaid,
    finalMTM: mtm,
    direction: instrument.amount >= 0 ? 'Long' : 'Short'
  });

  return mtm;
}

// Calcul des Greeks
export function calculateGreeks(
  instrument: any,
  marketData?: { 
    spotRates?: { [key: string]: number };
    volatilities?: { [key: string]: number };
    riskFreeRate?: number;
  }
) {
  // Seulement pour les options
  if (!instrument.type.includes('Call') && !instrument.type.includes('Put')) {
    return null;
  }

  const defaultRates = {
    EURUSD: 1.0856,
    EURGBP: 0.8434,
    EURJPY: 161.85,
    EURCHF: 0.9642
  };

  const currentRates = marketData?.spotRates || defaultRates;
  const domesticRate = instrument.riskFreeRate || marketData?.riskFreeRate || 0.02;
  const foreignRate = 0.005;
  
  const timeToExpiry = Math.max(0, (new Date(instrument.maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365));
  const volatility = instrument.impliedVolatility || 0.15;
  const spotRate = currentRates[`EUR${instrument.currency}`] || 1;
  
  let effectiveStrike = instrument.rate;
  if (instrument.strikeType === 'percentage') {
    effectiveStrike = spotRate * (instrument.rate / 100);
  }

  if (timeToExpiry <= 0) {
    return { delta: 0, gamma: 0, vega: 0, theta: 0 };
  }

  const isCall = instrument.type.includes('Call');

  return {
    delta: garmanKohlhagenDelta(spotRate, effectiveStrike, timeToExpiry, domesticRate, foreignRate, volatility, isCall) * instrument.amount,
    gamma: garmanKohlhagenGamma(spotRate, effectiveStrike, timeToExpiry, domesticRate, foreignRate, volatility) * instrument.amount,
    vega: garmanKohlhagenVega(spotRate, effectiveStrike, timeToExpiry, domesticRate, foreignRate, volatility) * instrument.amount,
    theta: garmanKohlhagenTheta(spotRate, effectiveStrike, timeToExpiry, domesticRate, foreignRate, volatility, isCall) * instrument.amount
  };
}

// Fonctions Black-Scholes legacy (gardées pour compatibilité)
export function blackScholesPrice(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number,
  isCall: boolean
): number {
  return garmanKohlhagenPrice(spotPrice, strikePrice, timeToExpiry, riskFreeRate, 0, volatility, isCall);
}

export function blackScholesDelta(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number,
  isCall: boolean
): number {
  return garmanKohlhagenDelta(spotPrice, strikePrice, timeToExpiry, riskFreeRate, 0, volatility, isCall);
}

export function blackScholesGamma(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number
): number {
  return garmanKohlhagenGamma(spotPrice, strikePrice, timeToExpiry, riskFreeRate, 0, volatility);
}

export function blackScholesVega(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number
): number {
  return garmanKohlhagenVega(spotPrice, strikePrice, timeToExpiry, riskFreeRate, 0, volatility);
}

export function blackScholesTheta(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number,
  isCall: boolean
): number {
  return garmanKohlhagenTheta(spotPrice, strikePrice, timeToExpiry, riskFreeRate, 0, volatility, isCall);
}
