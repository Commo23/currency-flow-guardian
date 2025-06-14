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

// Calcul de la volatilité implicite (approximation simple)
function calculateImpliedVolatility(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  optionPrice: number,
  isCall: boolean
): number {
  // Approximation de Brenner et Subrahmanyam
  const moneyness = Math.log(spotPrice / strikePrice);
  const sqrt2pi = Math.sqrt(2 * Math.PI);
  
  const initialGuess = sqrt2pi * optionPrice / spotPrice * Math.sqrt(1 / timeToExpiry);
  
  // Méthode de Newton-Raphson simplifiée
  let vol = initialGuess;
  for (let i = 0; i < 10; i++) {
    const bs = blackScholesPrice(spotPrice, strikePrice, timeToExpiry, riskFreeRate, vol, isCall);
    const vega = blackScholesVega(spotPrice, strikePrice, timeToExpiry, riskFreeRate, vol);
    
    if (Math.abs(vega) < 1e-10) break;
    
    const diff = bs - optionPrice;
    vol = vol - diff / vega;
    
    if (Math.abs(diff) < 1e-6) break;
  }
  
  return Math.max(0.01, vol); // Minimum 1% volatility
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

// Closed-form solution for barrier options (simplified)
export function barrierOptionClosedForm(
  spotPrice: number,
  strikePrice: number,
  barrier: number,
  timeToExpiry: number,
  domesticRate: number,
  foreignRate: number,
  volatility: number,
  isCall: boolean,
  isKnockOut: boolean
): number {
  if (timeToExpiry <= 0) return 0;

  // Simplified barrier option pricing using reflection principle
  const vanillaPrice = garmanKohlhagenPrice(spotPrice, strikePrice, timeToExpiry, domesticRate, foreignRate, volatility, isCall);
  
  // Barrier factor calculation
  const lambda = (domesticRate - foreignRate + 0.5 * volatility * volatility) / (volatility * volatility);
  const y = Math.log(barrier * barrier / (spotPrice * strikePrice)) / (volatility * Math.sqrt(timeToExpiry)) + lambda * volatility * Math.sqrt(timeToExpiry);
  
  const barrierFactor = Math.pow(barrier / spotPrice, 2 * lambda) * normalCDF(isCall ? y : -y);
  
  if (isKnockOut) {
    return vanillaPrice * (1 - barrierFactor);
  } else {
    return vanillaPrice * barrierFactor;
  }
}

// Monte Carlo simulation for digital options
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
  numSimulations: number = 10000
): number {
  if (timeToExpiry <= 0) return 0;

  let payoffSum = 0;
  const dt = timeToExpiry / 252; // Daily steps
  const drift = domesticRate - foreignRate - 0.5 * volatility * volatility;
  
  for (let i = 0; i < numSimulations; i++) {
    let currentSpot = spotPrice;
    let pathValid = true;
    
    // Simulate path
    for (let j = 0; j < 252 * timeToExpiry; j++) {
      const randomShock = Math.random() * 2 - 1; // Box-Muller would be better
      const gaussianRandom = Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * randomShock);
      
      currentSpot *= Math.exp(drift * dt + volatility * Math.sqrt(dt) * gaussianRandom);
      
      // Check barrier conditions
      if (isRange) {
        if (currentSpot <= lowerBarrier || currentSpot >= upperBarrier) {
          pathValid = false;
          break;
        }
      } else {
        if (currentSpot > lowerBarrier && currentSpot < upperBarrier) {
          pathValid = false;
          break;
        }
      }
    }
    
    if (pathValid) {
      payoffSum += payout;
    }
  }
  
  const averagePayoff = payoffSum / numSimulations;
  return averagePayoff * Math.exp(-domesticRate * timeToExpiry);
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
  const volatilities = marketData?.volatilities || defaultVols;
  const domesticRate = marketData?.riskFreeRate || 0.02;
  const foreignRate = 0.005; // Simplified foreign rate

  const timeToExpiry = Math.max(0, (new Date(instrument.maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365));
  const volatility = volatilities[`EUR${instrument.currency}`] || 0.15;
  const spotRate = currentRates[`EUR${instrument.currency}`] || 1;

  // Calculate effective parameters
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

  console.log('Calculating theoretical price for:', instrument.type, instrument.currency);

  switch (instrument.type) {
    case 'Forward':
      // Forward theoretical price (discounted difference)
      return instrument.amount * (spotRate - effectiveStrike) * Math.exp(-domesticRate * timeToExpiry);

    case 'Call':
    case 'Put':
      // Garman-Kohlhagen for vanilla options
      const isCall = instrument.type === 'Call';
      return garmanKohlhagenPrice(
        spotRate,
        effectiveStrike,
        timeToExpiry,
        domesticRate,
        foreignRate,
        volatility,
        isCall
      ) * instrument.amount;

    // Barrier options - Closed form
    case 'Call Knock-Out':
    case 'Put Knock-Out':
    case 'Call Knock-In':
    case 'Put Knock-In':
      const isCallBarrier = instrument.type.includes('Call');
      const isKnockOut = instrument.type.includes('Knock-Out');
      return barrierOptionClosedForm(
        spotRate,
        effectiveStrike,
        effectiveBarrier,
        timeToExpiry,
        domesticRate,
        foreignRate,
        volatility,
        isCallBarrier,
        isKnockOut
      ) * instrument.amount;

    // Digital options - Monte Carlo
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
        instrument.amount,
        isRange
      );

    case 'One Touch (beta)':
    case 'No Touch (beta)':
      // Simplified touch option pricing
      const isOneTouch = instrument.type.includes('One Touch');
      const touchProb = normalCDF(Math.log(effectiveBarrier / spotRate) / (volatility * Math.sqrt(timeToExpiry)));
      const expectedValue = isOneTouch ? touchProb * instrument.amount : (1 - touchProb) * instrument.amount;
      return expectedValue * Math.exp(-domesticRate * timeToExpiry);

    case 'Swap':
      // Swap theoretical value
      return instrument.amount * (spotRate - effectiveStrike) * timeToExpiry * Math.exp(-domesticRate * timeToExpiry);

    default:
      return calculateMTM(instrument, marketData);
  }
}

// Prix d'une option selon Black-Scholes
export function blackScholesPrice(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number,
  isCall: boolean
): number {
  if (timeToExpiry <= 0) {
    return Math.max(0, isCall ? spotPrice - strikePrice : strikePrice - spotPrice);
  }

  const d1 = (Math.log(spotPrice / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / 
             (volatility * Math.sqrt(timeToExpiry));
  const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

  if (isCall) {
    return spotPrice * normalCDF(d1) - strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2);
  } else {
    return strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2) - spotPrice * normalCDF(-d1);
  }
}

// Delta d'une option
export function blackScholesDelta(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number,
  isCall: boolean
): number {
  if (timeToExpiry <= 0) return 0;

  const d1 = (Math.log(spotPrice / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / 
             (volatility * Math.sqrt(timeToExpiry));

  return isCall ? normalCDF(d1) : normalCDF(d1) - 1;
}

// Gamma d'une option
export function blackScholesGamma(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number
): number {
  if (timeToExpiry <= 0) return 0;

  const d1 = (Math.log(spotPrice / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / 
             (volatility * Math.sqrt(timeToExpiry));

  const phi = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
  return phi / (spotPrice * volatility * Math.sqrt(timeToExpiry));
}

// Vega d'une option
export function blackScholesVega(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number
): number {
  if (timeToExpiry <= 0) return 0;

  const d1 = (Math.log(spotPrice / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / 
             (volatility * Math.sqrt(timeToExpiry));

  const phi = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
  return spotPrice * phi * Math.sqrt(timeToExpiry) / 100; // Divisé par 100 pour avoir le vega en %
}

// Theta d'une option
export function blackScholesTheta(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number,
  isCall: boolean
): number {
  if (timeToExpiry <= 0) return 0;

  const d1 = (Math.log(spotPrice / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / 
             (volatility * Math.sqrt(timeToExpiry));
  const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

  const phi = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);

  if (isCall) {
    return (-spotPrice * phi * volatility / (2 * Math.sqrt(timeToExpiry)) - 
            riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2)) / 365;
  } else {
    return (-spotPrice * phi * volatility / (2 * Math.sqrt(timeToExpiry)) + 
            riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2)) / 365;
  }
}

// Calcul du MTM pour tous types d'instruments avec données de marché personnalisées
export function calculateMTM(
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
  const volatilities = marketData?.volatilities || defaultVols;
  const riskFreeRate = marketData?.riskFreeRate || 0.02;

  const timeToExpiry = Math.max(0, (new Date(instrument.maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365));
  const volatility = volatilities[`EUR${instrument.currency}`] || 0.15;
  const spotRate = currentRates[`EUR${instrument.currency}`] || 1;

  console.log('Calculating MTM for:', instrument.type, instrument.currency, 'TTM:', timeToExpiry);

  // Calcul du strike effectif (en tenant compte du type)
  let effectiveStrike = instrument.rate;
  if (instrument.strikeType === 'percentage') {
    effectiveStrike = spotRate * (instrument.rate / 100);
  }

  // Calcul des barrières effectives
  let effectiveBarrier = instrument.barrier;
  let effectiveLowerBarrier = instrument.lowerBarrier;
  let effectiveUpperBarrier = instrument.upperBarrier;

  if (instrument.barrierType === 'percentage' && spotRate) {
    if (effectiveBarrier) effectiveBarrier = spotRate * (instrument.barrier / 100);
    if (effectiveLowerBarrier) effectiveLowerBarrier = spotRate * (instrument.lowerBarrier / 100);
    if (effectiveUpperBarrier) effectiveUpperBarrier = spotRate * (instrument.upperBarrier / 100);
  }

  switch (instrument.type) {
    case 'Forward':
      const mtmForward = instrument.amount * (spotRate - effectiveStrike);
      console.log('Forward MTM:', mtmForward, 'Current rate:', spotRate, 'Strike:', effectiveStrike);
      return mtmForward;

    case 'Call':
    case 'Put':
      const isCall = instrument.type === 'Call';
      
      if (timeToExpiry <= 0) {
        const intrinsicValue = Math.max(0, isCall ? 
          (spotRate - effectiveStrike) * instrument.amount : 
          (effectiveStrike - spotRate) * instrument.amount);
        const premiumPaid = instrument.premium || 0;
        return intrinsicValue - premiumPaid;
      }
      
      const optionValue = blackScholesPrice(
        spotRate,
        effectiveStrike,
        timeToExpiry,
        riskFreeRate,
        volatility,
        isCall
      );
      
      const premiumPaid = instrument.premium || 0;
      const mtmOption = (optionValue * instrument.amount) - premiumPaid;
      console.log('Option MTM:', mtmOption, 'Option value:', optionValue, 'Premium paid:', premiumPaid);
      return mtmOption;

    // Instruments à barrière
    case 'Call Knock-Out':
    case 'Put Knock-Out':
    case 'Call Knock-In':
    case 'Put Knock-In':
      return calculateBarrierOptionMTM(instrument, spotRate, effectiveStrike, effectiveBarrier, timeToExpiry, riskFreeRate, volatility);

    // Instruments à double barrière
    case 'Call Double Knock-Out':
    case 'Put Double Knock-Out':
    case 'Call Double Knock-In':
    case 'Put Double Knock-In':
      return calculateDoubleBarrierOptionMTM(instrument, spotRate, effectiveStrike, effectiveLowerBarrier, effectiveUpperBarrier, timeToExpiry, riskFreeRate, volatility);

    // Instruments Touch
    case 'One Touch (beta)':
    case 'No Touch (beta)':
      return calculateTouchOptionMTM(instrument, spotRate, effectiveBarrier, timeToExpiry, riskFreeRate, volatility);

    case 'Double Touch (beta)':
    case 'Double No Touch (beta)':
      return calculateDoubleTouchOptionMTM(instrument, spotRate, effectiveLowerBarrier, effectiveUpperBarrier, timeToExpiry, riskFreeRate, volatility);

    // Instruments binaires
    case 'Range Binary (beta)':
    case 'Outside Binary (beta)':
      return calculateBinaryOptionMTM(instrument, spotRate, effectiveLowerBarrier, effectiveUpperBarrier, timeToExpiry, riskFreeRate, volatility);

    case 'Swap':
      const mtmSwap = instrument.amount * (spotRate - effectiveStrike) * timeToExpiry;
      console.log('Swap MTM:', mtmSwap);
      return mtmSwap;

    default:
      console.log('Unknown instrument type, using random MTM');
      return Math.random() * 10000 - 5000;
  }
}

// Fonction pour calculer le MTM des options à barrière simple
function calculateBarrierOptionMTM(instrument: any, spot: number, strike: number, barrier: number, timeToExpiry: number, riskFreeRate: number, volatility: number): number {
  if (timeToExpiry <= 0) return 0;

  const isCall = instrument.type.includes('Call');
  const isKnockIn = instrument.type.includes('Knock-In');
  
  // Approximation simplifiée pour les options barrière
  const vanillaPrice = blackScholesPrice(spot, strike, timeToExpiry, riskFreeRate, volatility, isCall);
  
  // Facteur de réduction basé sur la proximité de la barrière
  const barrierDistance = Math.abs(spot - barrier) / spot;
  const barrierFactor = isKnockIn ? (1 - Math.exp(-barrierDistance * 5)) : Math.exp(-barrierDistance * 5);
  
  const optionValue = vanillaPrice * barrierFactor;
  const premiumPaid = instrument.premium || 0;
  
  return (optionValue * instrument.amount) - premiumPaid;
}

// Fonction pour calculer le MTM des options à double barrière
function calculateDoubleBarrierOptionMTM(instrument: any, spot: number, strike: number, lowerBarrier: number, upperBarrier: number, timeToExpiry: number, riskFreeRate: number, volatility: number): number {
  if (timeToExpiry <= 0) return 0;
  
  // Vérifier si le spot est dans la plage des barrières
  const isInRange = spot > lowerBarrier && spot < upperBarrier;
  const isKnockIn = instrument.type.includes('Knock-In');
  
  if (!isInRange && !isKnockIn) return 0; // Knock-out déjà activé
  if (isInRange && isKnockIn) return 0; // Knock-in pas encore activé
  
  const isCall = instrument.type.includes('Call');
  const vanillaPrice = blackScholesPrice(spot, strike, timeToExpiry, riskFreeRate, volatility, isCall);
  
  // Facteur de réduction pour double barrière
  const rangeWidth = (upperBarrier - lowerBarrier) / spot;
  const rangeFactor = Math.min(1, rangeWidth);
  
  const optionValue = vanillaPrice * rangeFactor;
  const premiumPaid = instrument.premium || 0;
  
  return (optionValue * instrument.amount) - premiumPaid;
}

// Fonction pour calculer le MTM des options Touch
function calculateTouchOptionMTM(instrument: any, spot: number, barrier: number, timeToExpiry: number, riskFreeRate: number, volatility: number): number {
  if (timeToExpiry <= 0) return 0;
  
  const isOneTouch = instrument.type.includes('One Touch');
  const hasHitBarrier = spot >= barrier; // Simplifié
  
  if (hasHitBarrier && isOneTouch) {
    return instrument.amount - (instrument.premium || 0);
  }
  
  if (hasHitBarrier && !isOneTouch) {
    return -(instrument.premium || 0);
  }
  
  // Probabilité simplifiée d'atteindre la barrière
  const d = Math.log(barrier / spot) / (volatility * Math.sqrt(timeToExpiry));
  const touchProbability = normalCDF(Math.abs(d));
  
  const expectedValue = isOneTouch ? touchProbability * instrument.amount : (1 - touchProbability) * instrument.amount;
  const premiumPaid = instrument.premium || 0;
  
  return expectedValue - premiumPaid;
}

// Fonction pour calculer le MTM des options Double Touch
function calculateDoubleTouchOptionMTM(instrument: any, spot: number, lowerBarrier: number, upperBarrier: number, timeToExpiry: number, riskFreeRate: number, volatility: number): number {
  if (timeToExpiry <= 0) return 0;
  
  const isDoubleTouch = instrument.type.includes('Double Touch');
  const hasHitLower = spot <= lowerBarrier;
  const hasHitUpper = spot >= upperBarrier;
  const hasHitEither = hasHitLower || hasHitUpper;
  
  if (hasHitEither && isDoubleTouch) {
    return instrument.amount - (instrument.premium || 0);
  }
  
  // Estimation simplifiée
  const expectedValue = isDoubleTouch ? 0.3 * instrument.amount : 0.7 * instrument.amount;
  const premiumPaid = instrument.premium || 0;
  
  return expectedValue - premiumPaid;
}

// Fonction pour calculer le MTM des options binaires
function calculateBinaryOptionMTM(instrument: any, spot: number, lowerBarrier: number, upperBarrier: number, timeToExpiry: number, riskFreeRate: number, volatility: number): number {
  if (timeToExpiry <= 0) return 0;
  
  const isRange = instrument.type.includes('Range');
  const isInRange = spot > lowerBarrier && spot < upperBarrier;
  
  // Pour les options binaires, le payout est fixe
  const payout = instrument.amount;
  const probability = isRange ? (isInRange ? 0.6 : 0.4) : (isInRange ? 0.4 : 0.6);
  
  const expectedValue = probability * payout;
  const premiumPaid = instrument.premium || 0;
  
  return expectedValue - premiumPaid;
}

// Calcul des sensibilités (Greeks) pour une option
export function calculateGreeks(
  instrument: any,
  currentRates: { [key: string]: number } = {
    EURUSD: 1.0856,
    EURGBP: 0.8434,
    EURJPY: 161.85,
    EURCHF: 0.9642
  }
) {
  if (!instrument.type.includes('Option')) {
    return null;
  }

  const timeToExpiry = Math.max(0, (new Date(instrument.maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365));
  const riskFreeRate = 0.02;
  const volatility = 0.15;
  const spotRate = currentRates[`EUR${instrument.currency}`] || 1;
  const isCall = instrument.type === 'Option Call';

  if (timeToExpiry <= 0) {
    return {
      delta: 0,
      gamma: 0,
      vega: 0,
      theta: 0
    };
  }

  return {
    delta: blackScholesDelta(spotRate, instrument.rate, timeToExpiry, riskFreeRate, volatility, isCall),
    gamma: blackScholesGamma(spotRate, instrument.rate, timeToExpiry, riskFreeRate, volatility),
    vega: blackScholesVega(spotRate, instrument.rate, timeToExpiry, riskFreeRate, volatility),
    theta: blackScholesTheta(spotRate, instrument.rate, timeToExpiry, riskFreeRate, volatility, isCall)
  };
}
