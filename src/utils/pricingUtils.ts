import { IPricingConfig } from '../models/PricingConfig';

export interface PricingBreakdown {
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    deliveryFee: number;
    discountAmount: number;
    total: number;
}

/**
 * Pure function — computes the full order price breakdown from a subtotal and
 * a PricingConfig snapshot. No DB access; safe to call from both the
 * /calculate endpoint and the order-creation flow.
 */
export function computePricing(
    subtotal: number,
    config: IPricingConfig,
    discountAmount: number = 0
): PricingBreakdown {
    const taxAmount = config.taxEnabled
        ? parseFloat(((subtotal * config.taxRate) / 100).toFixed(2))
        : 0;

    let deliveryFee = 0;
    if (config.deliveryEnabled) {
        const threshold = config.freeDeliveryThreshold;
        deliveryFee = threshold > 0 && subtotal >= threshold ? 0 : config.deliveryFee;
    }

    const total = parseFloat(
        (subtotal + taxAmount + deliveryFee - discountAmount).toFixed(2)
    );

    return {
        subtotal:       parseFloat(subtotal.toFixed(2)),
        taxRate:        config.taxRate,
        taxAmount,
        deliveryFee,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        total,
    };
}
