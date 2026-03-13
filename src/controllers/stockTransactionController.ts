import StockTransaction from "../models/StockTransaction";
import { Product } from "../models/Product";
import { protect, admin } from "../utils/authPlugin";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";

export default function (appRouter: Router) {
    // @desc    Create new stock transaction
    // @route   POST /api/v1/stock-transactions
    // @access  Private/Admin
    appRouter.post("/api/v1/stock-transactions", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const { productId, type, quantity, reference, notes, transactionDate } = body;

            const product = await Product.findById(productId);
            if (!product) {
                return appRouter.sendResponse(res, 404, { message: "Product not found" });
            }

            const previousStock = product.quantity;
            let newStock = previousStock;

            if (['STOCK_IN', 'RETURN_TO_SUPPLIER', 'ADJUSTMENT'].includes(type)) { // Note Java logic might differ slightly, but typically IN adds
                if (type === 'RETURN_TO_SUPPLIER') {
                    newStock -= quantity;
                } else {
                    newStock += quantity;
                }
            } else {
                newStock -= quantity;
            }

            // In a real application, ADJUSTMENT could be exact new stock or diff. Let's assume quantity is the diff to add/subtract. 
            // If Java logic was different (e.g., ADJUSTMENT is absolute value), we need to check, but this is a standard approach.

            const transaction = await StockTransaction.create({
                product: productId,
                type,
                quantity,
                previousStock,
                newStock,
                reference,
                notes,
                transactionDate: transactionDate || new Date()
            });

            product.quantity = newStock;
            await product.save();

            const mapped = {
                id: transaction._id,
                productId: transaction.product,
                type: transaction.type,
                quantity: transaction.quantity,
                previousStock: transaction.previousStock,
                newStock: transaction.newStock,
                reference: transaction.reference,
                notes: transaction.notes,
                transactionDate: transaction.transactionDate,
                createdAt: transaction.createdAt
            };

            appRouter.sendResponse(res, 201, { message: "Stock transaction created successfully", data: mapped });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get transaction by ID
    // @route   GET /api/v1/stock-transactions/:id
    // @access  Private/Admin
    appRouter.get("/api/v1/stock-transactions/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const transaction = await StockTransaction.findById(req.params.id).populate('product', 'name sku');
            if (!transaction) {
                return appRouter.sendResponse(res, 404, { message: "Transaction not found" });
            }

            const mapped = {
                id: transaction._id,
                productId: transaction.product, // It's populated now, so it will be an object if we want
                productName: (transaction.product as any).name,
                type: transaction.type,
                quantity: transaction.quantity,
                previousStock: transaction.previousStock,
                newStock: transaction.newStock,
                reference: transaction.reference,
                notes: transaction.notes,
                transactionDate: transaction.transactionDate,
                createdAt: transaction.createdAt
            };

            appRouter.sendResponse(res, 200, { message: "Transaction retrieved successfully", data: mapped });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get transactions by Product ID
    // @route   GET /api/v1/stock-transactions/product/:productId
    // @access  Private/Admin
    appRouter.get("/api/v1/stock-transactions/product/:productId", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const transactions = await StockTransaction.find({ product: req.params.productId }).sort({ transactionDate: -1 });

            const mapped = transactions.map(t => ({
                id: t._id,
                productId: t.product,
                type: t.type,
                quantity: t.quantity,
                previousStock: t.previousStock,
                newStock: t.newStock,
                reference: t.reference,
                notes: t.notes,
                transactionDate: t.transactionDate,
                createdAt: t.createdAt
            }));

            appRouter.sendResponse(res, 200, { message: "Product transactions retrieved successfully", data: mapped });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get all transactions (search)
    // @route   POST /api/v1/stock-transactions/all
    // @access  Private/Admin
    appRouter.post("/api/v1/stock-transactions/all", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const pageNo = body.pageNo || 1;
            const pageSize = body.pageSize || 10;
            const productId = body.productId;
            const type = body.type;

            const query: any = {};
            if (productId) query.product = productId;
            if (type) query.type = type;

            const totalElements = await StockTransaction.countDocuments(query);
            const totalPages = Math.ceil(totalElements / pageSize);

            const transactions = await StockTransaction.find(query)
                .populate('product', 'name sku')
                .skip((pageNo - 1) * pageSize)
                .limit(pageSize)
                .sort({ transactionDate: -1 });

            const mapped = transactions.map(t => ({
                id: t._id,
                productId: (t.product as any)._id,
                productName: (t.product as any).name,
                type: t.type,
                quantity: t.quantity,
                previousStock: t.previousStock,
                newStock: t.newStock,
                reference: t.reference,
                notes: t.notes,
                transactionDate: t.transactionDate,
                createdAt: t.createdAt
            }));

            appRouter.sendResponse(res, 200, {
                message: "Transactions fetched successfully",
                data: {
                    content: mapped,
                    pageNo,
                    pageSize,
                    totalElements,
                    totalPages,
                    last: pageNo >= totalPages
                }
            });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Delete transaction
    // @route   DELETE /api/v1/stock-transactions/:id
    // @access  Private/Admin
    appRouter.delete("/api/v1/stock-transactions/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const transaction = await StockTransaction.findById(req.params.id);
            if (!transaction) {
                return appRouter.sendResponse(res, 404, { message: "Transaction not found" });
            }

            const product = await Product.findById(transaction.product);
            if (product) {
                // Reverse the transaction stock change
                let currentStock = product.quantity;
                const diff = transaction.newStock - transaction.previousStock;
                currentStock -= diff;
                product.quantity = currentStock;
                await product.save();
            }

            await StockTransaction.findByIdAndDelete(req.params.id);

            appRouter.sendResponse(res, 200, { message: "Transaction deleted and stock reversed successfully", data: null });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });
}
