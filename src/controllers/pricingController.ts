import { IncomingMessage, ServerResponse } from 'http';
import { Router } from '../utils/Router';
import { protect, admin } from '../utils/authPlugin';
import { PricingConfig, getOrCreatePricingConfig } from '../models/PricingConfig';
import { computePricing } from '../utils/pricingUtils';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { getCurrentPrice } from '../utils/promotionUtils';

export default function (appRouter: Router) {

    // ── GET /api/v1/pricing-config (public) ───────────────────────────────────
    appRouter.get('/api/v1/pricing-config', async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const config = await getOrCreatePricingConfig();
            appRouter.sendResponse(res, 200, config.toObject());
        } catch (error) {
            console.error('Get PricingConfig Error:', error);
            appRouter.sendResponse(res, 500, { message: 'Server error' });
        }
    });

    // ── POST /api/v1/orders/calculate (protected) ─────────────────────────────
    // Returns a full price breakdown WITHOUT creating an order.
    appRouter.post('/api/v1/orders/calculate', async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const { items: directItems, isBuyNow } = await appRouter.parseJsonBody(req);

            let itemsToProcess = directItems;
            let usedCart = false;

            if (!isBuyNow || !itemsToProcess || itemsToProcess.length === 0) {
                const cart = await Cart.findOne({ userId, status: 'ACTIVE' }).populate('items');
                if (!cart || cart.items.length === 0) {
                    return appRouter.sendResponse(res, 400, { message: 'Cart is empty' });
                }
                itemsToProcess = cart.items;
                usedCart = true;
            }

            let subtotal = 0;

            for (const rawItem of itemsToProcess) {
                const productId = usedCart ? rawItem.product : rawItem.productId;
                const quantity   = rawItem.quantity;
                const variantId  = rawItem.variantId ?? null;

                const product = await Product.findById(productId);
                if (!product || product.quantity < quantity) {
                    return appRouter.sendResponse(res, 400, {
                        message: `Product ${product ? product.name : productId} is out of stock.`,
                    });
                }

                let unitPrice = usedCart ? (rawItem.unitPrice || 0) : 0;
                if (!usedCart || unitPrice <= 0) {
                    let additionalPrice = 0;
                    if (variantId != null) {
                        const variant = product.variants.find((v: any) => Number(v._id) === Number(variantId));
                        if (variant) additionalPrice = variant.additionalPrice || 0;
                    }
                    unitPrice = (await getCurrentPrice(product)) + additionalPrice;
                }

                subtotal += quantity * unitPrice;
            }

            const config = await getOrCreatePricingConfig();
            const breakdown = computePricing(subtotal, config, 0);
            appRouter.sendResponse(res, 200, breakdown);
        } catch (error) {
            console.error('Calculate Order Error:', error);
            appRouter.sendResponse(res, 500, { message: 'Server error' });
        }
    });

    // ── GET /api/v1/admin/pricing-config (admin) ──────────────────────────────
    appRouter.get('/api/v1/admin/pricing-config', async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;
            const config = await getOrCreatePricingConfig();
            appRouter.sendResponse(res, 200, config.toObject());
        } catch (error) {
            console.error('Admin Get PricingConfig Error:', error);
            appRouter.sendResponse(res, 500, { message: 'Server error' });
        }
    });

    // ── PUT /api/v1/admin/pricing-config (admin) ──────────────────────────────
    appRouter.put('/api/v1/admin/pricing-config', async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);

            const update: any = {};
            if (body.taxRate           !== undefined) update.taxRate           = Number(body.taxRate);
            if (body.taxEnabled        !== undefined) update.taxEnabled        = Boolean(body.taxEnabled);
            if (body.deliveryFee       !== undefined) update.deliveryFee       = Number(body.deliveryFee);
            if (body.deliveryEnabled   !== undefined) update.deliveryEnabled   = Boolean(body.deliveryEnabled);
            if (body.freeDeliveryThreshold !== undefined) update.freeDeliveryThreshold = Number(body.freeDeliveryThreshold);

            const config = await PricingConfig.findOneAndUpdate(
                {},
                { $set: update },
                { new: true, upsert: true }
            );
            appRouter.sendResponse(res, 200, config!.toObject());
        } catch (error) {
            console.error('Admin Update PricingConfig Error:', error);
            appRouter.sendResponse(res, 500, { message: 'Server error' });
        }
    });
}
