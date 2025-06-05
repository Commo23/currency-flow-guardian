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

  console.log('Calculating MTM for:', instrument.type, instrument.currency, 'TTM:', timeToExpiry);

  switch (instrument.type) {
    case 'Forward':
      const forwardRate = currentRates[`EUR${instrument.currency}`] || 1;
      const mtmForward = instrument.amount * (forwardRate - instrument.rate);
      console.log('Forward MTM:', mtmForward, 'Current rate:', forwardRate, 'Strike:', instrument.rate);
      return mtmForward;

    case 'Option Call':
    case 'Option Put':
      const spotRate = currentRates[`EUR${instrument.currency}`] || 1;
      const isCall = instrument.type === 'Option Call';
      
      if (timeToExpiry <= 0) {
        // Option expirée - valeur intrinsèque
        const intrinsicValue = Math.max(0, isCall ? 
          (spotRate - instrument.rate) * instrument.amount : 
          (instrument.rate - spotRate) * instrument.amount);
        const premiumPaid = instrument.premium || 0;
        console.log('Expired option MTM:', intrinsicValue - premiumPaid);
        return intrinsicValue - premiumPaid;
      }
      
      const optionValue = blackScholesPrice(
        spotRate,
        instrument.rate,
        timeToExpiry,
        riskFreeRate,
        volatility,
        isCall
      );
      
      const premiumPaid = instrument.premium || 0;
      const mtmOption = (optionValue * instrument.amount) - premiumPaid;
      console.log('Option MTM:', mtmOption, 'Option value:', optionValue, 'Premium paid:', premiumPaid);
      return mtmOption;

    case 'Swap':
      // Calcul simplifié pour un swap
      const swapRate = currentRates[`EUR${instrument.currency}`] || 1;
      const mtmSwap = instrument.amount * (swapRate - instrument.rate) * timeToExpiry;
      console.log('Swap MTM:', mtmSwap);
      return mtmSwap;

    default:
      console.log('Unknown instrument type, using random MTM');
      return Math.random() * 10000 - 5000; // Simulation pour autres instruments
  }
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
