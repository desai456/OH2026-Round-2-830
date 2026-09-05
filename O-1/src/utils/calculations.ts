import { Quote, QuoteLine, Product, Customer, RiskFactor, RiskLevel, UserRole, WarehouseAllocation, Warehouse } from '../types';
import { PRODUCTS, CUSTOMERS, RULES_CONFIG, WAREHOUSES } from '../data/mockData';

export interface QuoteCalculations {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  oneTimeTotal: number;
  recurringMRR: number;
  recurringARR: number;
  contractValue: number;
  totalCost: number;
  grossMargin: number;
  marginPercent: number;
  marginHealth: 'HEALTHY' | 'WATCH' | 'AT RISK';
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  approvalRequired: boolean;
  requiresManager: boolean;
  requiresFinance: boolean;
  lineDetails: Array<QuoteLine & {
    product: Product;
    unitPriceWithConfig: number;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    finalLineTotal: number;
    costTotal: number;
    marginAmount: number;
    marginPercent: number;
    categoryLimit: number;
    exceedsCategoryLimit: boolean;
    exceedsTierLimit: boolean;
  }>;
}

export function calculateQuoteMetrics(quote: Quote): QuoteCalculations {
  const customer = CUSTOMERS.find(c => c.id === quote.customerId) || CUSTOMERS[0];
  const tierLimit = RULES_CONFIG.tierLimits[customer.tier] || 15;

  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let oneTimeTotal = 0;
  let recurringMRR = 0;
  let totalCost = 0;
  
  const riskFactors: RiskFactor[] = [];
  let riskScore = 15; // Base low risk score

  const lineDetails = quote.lines.map(line => {
    const product = PRODUCTS.find(p => p.id === line.productId) || {
      id: line.productId,
      name: 'Custom Enterprise Item',
      sku: 'SKU-CUSTOM',
      category: 'Hardware',
      basePrice: line.unitPrice,
      cost: line.unitPrice * 0.6,
      unit: 'Each',
      description: '',
    } as Product;

    const unitPriceWithConfig = line.unitPrice + (line.configAdjustment || 0);
    const lineSubtotal = unitPriceWithConfig * line.qty;
    const discountAmount = lineSubtotal * (line.discountPercent / 100);
    const netLineTotal = lineSubtotal - discountAmount;
    const taxAmount = netLineTotal * (line.taxPercent / 100);
    const finalLineTotal = netLineTotal + taxAmount;
    const costTotal = (product.cost || line.unitPrice * 0.6) * line.qty;
    const marginAmount = netLineTotal - costTotal;
    const marginPercent = netLineTotal > 0 ? (marginAmount / netLineTotal) * 100 : 0;

    subtotal += lineSubtotal;
    totalDiscount += discountAmount;
    totalTax += taxAmount;
    totalCost += costTotal;

    if (product.category === 'Subscription') {
      recurringMRR += netLineTotal;
    } else {
      oneTimeTotal += finalLineTotal;
    }

    const catLimit = RULES_CONFIG.categoryLimits[product.category] || 15;
    const exceedsCategoryLimit = line.discountPercent > catLimit;
    const exceedsTierLimit = line.discountPercent > tierLimit;

    if (exceedsCategoryLimit) {
      const delta = line.discountPercent - catLimit;
      riskScore += Math.min(35, delta * 3.5);
      riskFactors.push({
        id: `rf-cat-${line.id}`,
        title: `${product.category} Limit Exceeded`,
        severity: delta > 5 ? 'danger' : 'warning',
        message: `${product.name} discount (${line.discountPercent}%) exceeds ${product.category} rule threshold (${catLimit}%) by +${delta.toFixed(1)}%.`,
        points: Math.round(delta * 3.5),
      });
    }

    if (exceedsTierLimit && !exceedsCategoryLimit) {
      const delta = line.discountPercent - tierLimit;
      riskScore += Math.min(25, delta * 2.5);
      riskFactors.push({
        id: `rf-tier-${line.id}`,
        title: `${customer.tier} Tier Discount Variance`,
        severity: 'warning',
        message: `Discount (${line.discountPercent}%) is above ${customer.tier} tier standard limit (${tierLimit}%).`,
        points: Math.round(delta * 2.5),
      });
    }

    if (marginPercent < 25) {
      riskScore += 20;
      riskFactors.push({
        id: `rf-margin-${line.id}`,
        title: 'Low Margin Item',
        severity: marginPercent < 15 ? 'danger' : 'warning',
        message: `${product.name} line margin is ${marginPercent.toFixed(1)}% (Target: >=30%).`,
        points: 20,
      });
    }

    return {
      ...line,
      product,
      unitPriceWithConfig,
      subtotal: lineSubtotal,
      discountAmount,
      taxAmount,
      finalLineTotal,
      costTotal,
      marginAmount,
      marginPercent,
      categoryLimit: catLimit,
      exceedsCategoryLimit,
      exceedsTierLimit,
    };
  });

  const netRevenue = subtotal - totalDiscount;
  const grossMargin = netRevenue - totalCost;
  const marginPercent = netRevenue > 0 ? (grossMargin / netRevenue) * 100 : 0;
  const recurringARR = recurringMRR * 12;
  const contractValue = oneTimeTotal + recurringARR;

  if (marginPercent < 25) {
    riskScore += 20;
    riskFactors.push({
      id: 'rf-overall-margin',
      title: 'Overall Deal Margin Warning',
      severity: marginPercent < 20 ? 'danger' : 'warning',
      message: `Overall deal margin is ${marginPercent.toFixed(1)}%, below the corporate 30% baseline.`,
      points: 20,
    });
  }

  // Cap risk score between 0 and 100
  riskScore = Math.min(100, Math.max(5, Math.round(riskScore)));

  let riskLevel: RiskLevel = 'LOW';
  if (riskScore >= 60) riskLevel = 'HIGH';
  else if (riskScore >= 35) riskLevel = 'MEDIUM';

  let marginHealth: 'HEALTHY' | 'WATCH' | 'AT RISK' = 'HEALTHY';
  if (marginPercent < 20) marginHealth = 'AT RISK';
  else if (marginPercent < 30) marginHealth = 'WATCH';

  // Determine Approval Requirements
  const requiresManager = riskScore >= 35 || lineDetails.some(l => l.discountPercent > 5);
  const requiresFinance = riskScore >= 60 || lineDetails.some(l => l.exceedsCategoryLimit || l.discountPercent > tierLimit) || marginPercent < 30;
  const approvalRequired = requiresManager || requiresFinance;

  return {
    subtotal,
    totalDiscount,
    totalTax,
    oneTimeTotal,
    recurringMRR,
    recurringARR,
    contractValue,
    totalCost,
    grossMargin,
    marginPercent,
    marginHealth,
    riskScore,
    riskLevel,
    riskFactors,
    approvalRequired,
    requiresManager,
    requiresFinance,
    lineDetails,
  };
}

export function calculateWarehouseSplit(productId: string, quantity: number): { allocations: WarehouseAllocation[]; totalShipments: number; estimatedShipping: number; recommendationReason: string } {
  const product = PRODUCTS.find(p => p.id === productId);
  const mainWh = WAREHOUSES[0];
  const eastWh = WAREHOUSES[1];

  let remaining = quantity;
  const allocations: WarehouseAllocation[] = [];

  const mainAvail = mainWh.availableStock[productId] || 0;
  const mainAlloc = Math.min(remaining, mainAvail);

  if (mainAlloc > 0) {
    allocations.push({
      warehouseId: mainWh.id,
      warehouseName: mainWh.name,
      productId,
      allocatedQty: mainAlloc,
      shippingCost: Math.round(mainAlloc * 4.2),
    });
    remaining -= mainAlloc;
  }

  if (remaining > 0) {
    const eastAvail = eastWh.availableStock[productId] || 0;
    const eastAlloc = Math.min(remaining, eastAvail);
    if (eastAlloc > 0) {
      allocations.push({
        warehouseId: eastWh.id,
        warehouseName: eastWh.name,
        productId,
        allocatedQty: eastAlloc,
        shippingCost: Math.round(eastAlloc * 4.5),
      });
      remaining -= eastAlloc;
    }
  }

  const totalShipments = allocations.length;
  const estimatedShipping = allocations.reduce((sum, a) => sum + a.shippingCost, 0);
  const recommendationReason = allocations.length > 1
    ? `Split allocation optimized across ${totalShipments} hubs to fulfill total order volume (${quantity} units) with lowest freight latency.`
    : `Single-hub fulfillment recommendation from ${allocations[0]?.warehouseName || 'Main Hub'} for lowest shipment count.`;

  return {
    allocations,
    totalShipments,
    estimatedShipping,
    recommendationReason,
  };
}

export function calculateProration(currentSeats: number, newSeats: number, monthlyRatePerSeat: number, daysRemainingInPeriod: number, totalDaysInPeriod: number = 30) {
  const currentMonthly = currentSeats * monthlyRatePerSeat;
  const newMonthly = newSeats * monthlyRatePerSeat;
  const monthlyDifference = newMonthly - currentMonthly;
  const fractionRemaining = daysRemainingInPeriod / totalDaysInPeriod;
  const proratedCharge = Math.round(monthlyDifference * fractionRemaining * 100) / 100;

  return {
    currentSeats,
    newSeats,
    seatDelta: newSeats - currentSeats,
    currentMonthly,
    newMonthly,
    monthlyDifference,
    daysRemainingInPeriod,
    fractionRemaining: Math.round(fractionRemaining * 100),
    proratedCharge,
  };
}

export function detectDiscountAnomaly(repName: string, currentDiscountPercent: number) {
  const typicalRepDiscount = 7.2; // Benchmark
  const variance = currentDiscountPercent - typicalRepDiscount;
  const isAnomaly = variance >= 8;

  return {
    repName,
    typicalDiscount: typicalRepDiscount,
    currentDiscount: currentDiscountPercent,
    variance: Math.round(variance * 10) / 10,
    isAnomaly,
  };
}
