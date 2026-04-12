import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingConfig extends Document {
    taxRate: number;
    taxEnabled: boolean;
    deliveryFee: number;
    deliveryEnabled: boolean;
    freeDeliveryThreshold: number;
}

const pricingConfigSchema = new Schema<IPricingConfig>({
    taxRate:                { type: Number,  default: 10 },
    taxEnabled:             { type: Boolean, default: true },
    deliveryFee:            { type: Number,  default: 2.50 },
    deliveryEnabled:        { type: Boolean, default: true },
    freeDeliveryThreshold:  { type: Number,  default: 50 },
}, { timestamps: true });

export const PricingConfig = mongoose.model<IPricingConfig>('PricingConfig', pricingConfigSchema);

/** Always returns the single config document, seeding defaults on first call. */
export async function getOrCreatePricingConfig(): Promise<IPricingConfig> {
    const config = await PricingConfig.findOneAndUpdate(
        {},
        {
            $setOnInsert: {
                taxRate: 10,
                taxEnabled: true,
                deliveryFee: 2.50,
                deliveryEnabled: true,
                freeDeliveryThreshold: 50,
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return config!;
}
