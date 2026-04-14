import mongoose, { Schema, Document } from 'mongoose';

export interface IPendingRegistration extends Document {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    otp: string;
    otpExpiresAt: Date;
    createdAt: Date;
}

const pendingRegistrationSchema = new Schema<IPendingRegistration>({
    username: { type: String, required: true },
    email:    { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    otp:           { type: String, required: true },
    otpExpiresAt:  { type: Date,   required: true },
}, {
    timestamps: true
});

// Auto-delete documents 10 minutes after creation if OTP is never verified
pendingRegistrationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

export default mongoose.model<IPendingRegistration>('PendingRegistration', pendingRegistrationSchema);
