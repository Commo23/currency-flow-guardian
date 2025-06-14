
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

// Options à barrière - formule analytique complète
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
    // Vérifier si la barrière a été touchée à l'expiration
    const barrierTouched = isCall ? 
      (spotPrice <= barrier) : 
      (spotPrice >= barrier);
    
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
  const y = Math.log(barrier * barrier / (spotPrice * strikePrice)) / (volatility * Math.sqrt(timeToExpiry)) + 
           lambda * volatility * Math.sqrt(timeToExpiry);
  
  const x1 = Math.log(spotPrice / strikePrice) / (volatility * Math.sqrt(timeToExpiry)) + 
            lambda * volatility * Math.sqrt(timeToExpiry);
  const y1 = Math.log(barrier / spotPrice) / (volatility * Math.sqrt(timeToExpiry)) + 
            lambda * volatility * Math.sqrt(timeToExpiry);

  // Prix vanilla pour référence
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
        barrierPrice = A - B - C + rebate * Math.exp(-domesticRate * timeToExpiry);
      } else {
        barrierPrice = B + C - rebate * Math.exp(-domesticRate * timeToExpiry);
      }
    } else {
      // Up-and-out call
      if (isKnockOut) {
        barrierPrice = rebate * Math.exp(-domesticRate * timeToExpiry);
      } else {
        barrierPrice = vanillaPrice - rebate * Math.exp(-domesticRate * timeToExpiry);
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
        barrierPrice = A - B - C + rebate * Math.exp(-domesticRate * timeToExpiry);
      } else {
        barrierPrice = B + C - rebate * Math.exp(-domesticRate * timeToExpiry);
      }
    } else {
      // Down-and-out put
      if (isKnockOut) {
        barrierPrice = rebate * Math.exp(-domesticRate * timeToExpiry);
      } else {
        barrierPrice = vanillaPrice - rebate * Math.exp(-domesticRate * timeToExpiry);
      }
    }
  }

  return Math.max(0, barrierPrice);
}

// Monte Carlo pour options digitales complexes
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
  numSimulations: number = 100000
): number {
  if (timeToExpiry <= 0) {
    const isInRange = spotPrice > lowerBarrier && spotPrice < upperBarrier;
    return isRange === isInRange ? payout * Math.exp(-domesticRate * timeToExpiry) : 0;
  }

  let payoffSum = 0;
  const numSteps = Math.max(50, Math.floor(timeToExpiry * 252));
  const dt = timeToExpiry / numSteps;
  const drift = domesticRate - foreignRate - 0.5 * volatility * volatility;
  const diffusion = volatility * Math.sqrt(dt);
  
  for (let i = 0; i < numSimulations; i++) {
    let currentSpot = spotPrice;
    let pathValid = true;
    
    for (let j = 0; j < numSteps && pathValid; j++) {
      const gaussianRandom = normalInverse();
      currentSpot *= Math.exp(drift * dt + diffusion * gaussianRandom);
      
      if (isRange) {
        if (currentSpot <= lowerBarrier || currentSpot >= upperBarrier) {
          pathValid = false;
        }
      } else {
        if (currentSpot <= lowerBarrier || currentSpot >= upperBarrier) {
          pathValid = false;
          payoffSum += payout;
          break;
        }
      }
    }
    
    if (isRange && pathValid) {
      payoffSum += payout;
    }
  }
  
  return (payoffSum / numSimulations) * Math.exp(-domesticRate * timeToExpiry);
}

// Générateur de nombres gaussiens (Box-Muller)
function normalInverse(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Calculate theoretical price based on instrument type
export function calculateTheoreticalPrice(
  instrument: any,
  marketData?: { 
    spotRates?: { [key: string]: number };
    volatilities?: { [key: string]: number };
    riskFreeRate?: number;
  }
): number {
  const defaultRates = {
    EURUSD: 1.0856,
    EURGBP: 0.8434,
    EURJPY: 161.85,
    EURCHF: 0.9642
  };

  const defaultVols = {
    EURUSD: 0.12,
    EURGBP: 0.10,
    EURJPY: 0.15,
    EURCHF: 0.08
  };

  const currentRates = marketData?.spotRates || defaultRates;
  const marketVolatilities = marketData?.volatilities || defaultVols;
  const domesticRate = instrument.riskFreeRate || marketData?.riskFreeRate || 0.02;
  const foreignRate = 0.005;

  const timeToExpiry = Math.max(0, (new Date(instrument.maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365));
  const volatility = instrument.impliedVolatility || marketVolatilities[`EUR${instrument.currency}`] || 0.15;
  const spotRate = currentRates[`EUR${instrument.currency}`] || 1;

  // Calcul des paramètres effectifs
  let effectiveStrike = instrument.rate;
  if (instrument.strikeType === 'percentage') {
    effectiveStrike = spotRate * (instrument.rate / 100);
  }

  let effectiveBarrier = instrument.barrier;
  let effectiveLowerBarrier = instrument.lowerBarrier;
  let effectiveUpperBarrier = instrument.upperBarrier;

  if (instrument.barrierType === 'percentage' && spotRate) {
    if (effectiveBarrier) effectiveBarrier = spotRate * (instrument.barrier / 100);
    if (effectiveLowerBarrier) effectiveLowerBarrier = spotRate * (instrument.lowerBarrier / 100);
    if (effectiveUpperBarrier) effectiveUpperBarrier = spotRate * (instrument.upperBarrier / 100);
  }

  console.log('Calculating theoretical price for:', {
    type: instrument.type,
    currency: instrument.currency,
    spot: spotRate,
    strike: effectiveStrike,
    volatility: volatility,
    timeToExpiry: timeToExpiry
  });

  switch (instrument.type) {
    case 'Forward':
      return (spotRate - effectiveStrike) * Math.exp(-domesticRate * timeToExpiry);

    case 'Call':
    case 'Put':
      const isCall = instrument.type === 'Call';
      return garmanKohlhagenPrice(
        spotRate,
        effectiveStrike,
        timeToExpiry,
        domesticRate,
        foreignRate,
        volatility,
        isCall
      );

    case 'Call Knock-Out':
    case 'Put Knock-Out':
    case 'Call Knock-In':
    case 'Put Knock-In':
      const isCallBarrier = instrument.type.includes('Call');
      const isKnockOut = instrument.type.includes('Knock-Out');
      return barrierOptionPrice(
        spotRate,
        effectiveStrike,
        effectiveBarrier,
        timeToExpiry,
        domesticRate,
        foreignRate,
        volatility,
        isCallBarrier,
        isKnockOut,
        instrument.rebate || 0
      );

    case 'Range Binary (beta)':
    case 'Outside Binary (beta)':
      const isRange = instrument.type.includes('Range');
      return monteCarloDigitalOption(
        spotRate,
        effectiveLowerBarrier,
        effectiveUpperBarrier,
        timeToExpiry,
        domesticRate,
        foreignRate,
        volatility,
        1,
        isRange
      );

    case 'One Touch (beta)':
    case 'No Touch (beta)':
      const isOneTouch = instrument.type.includes('One Touch');
      const d = Math.log(effectiveBarrier / spotRate) / (volatility * Math.sqrt(timeToExpiry));
      const touchProb = 2 * normalCDF(Math.abs(d)) - 1;
      const expectedValue = isOneTouch ? touchProb : (1 - touchProb);
      return expectedValue * Math.exp(-domesticRate * timeToExpiry);

    case 'Swap':
      return (spotRate - effectiveStrike) * timeToExpiry * Math.exp(-domesticRate * timeToExpiry);

    default:
      console.warn('Unknown instrument type:', instrument.type);
      return 0;
  }
}

// Calcul du MTM pour tous types d'instruments
export function calculateMTM(
  instrument: any,
  marketData?: { 
    spotRates?: { [key: string]: number };
    volatilities?: { [key: string]: number };
    riskFreeRate?: number;
  }
): number {
  const theoreticalPricePerUnit = calculateTheoreticalPrice(instrument, marketData);
  const totalTheoreticalValue = theoreticalPricePerUnit * Math.abs(instrument.amount);
  const premiumPaid = instrument.premium || 0;
  
  console.log('MTM Calculation:', {
    instrument: instrument.type,
    theoreticalPricePerUnit,
    amount: instrument.amount,
    totalTheoreticalValue,
    premiumPaid,
    mtm: totalTheoreticalValue - premiumPaid
  });

  // Pour les forwards et swaps, pas de prime
  if (instrument.type === 'Forward' || instrument.type === 'Swap') {
    return totalTheoreticalValue;
  }

  // Pour les options, MTM = valeur théorique - prime payée
  return totalTheoreticalValue - premiumPaid;
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
