import mongoose, { Schema, Document } from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement';

export interface IStockTransaction extends Document<string> {
    id: number;
    product: number; // reference to Product _id
    type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN_TO_SUPPLIER' | 'PRODUCTION' | 'SAMPLE' | 'DAMAGED' | 'EXPIRED';
    quantity: number;
    previousStock: number;
    newStock: number;
    reference?: string;
    notes?: string;
    transactionDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const stockTransactionSchema = new Schema<IStockTransaction>({
    _id: Number,
    product: {
        type: Number,
        ref: 'Product',
        required: true
    },
    type: {
        type: String,
        enum: ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'TRANSFER', 'RETURN_TO_SUPPLIER', 'PRODUCTION', 'SAMPLE', 'DAMAGED', 'EXPIRED'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    previousStock: {
        type: Number,
        default: 0
    },
    newStock: {
        type: Number,
        default: 0
    },
    reference: {
        type: String,
        maxLength: 100
    },
    notes: {
        type: String
    },
    transactionDate: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

stockTransactionSchema.plugin(autoIncrementPlugin, { modelName: 'StockTransaction', field: '_id' });

export default mongoose.model<IStockTransaction>('StockTransaction', stockTransactionSchema);
