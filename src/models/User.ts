// Updated User.ts with Plaid integration
import { Document, Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    createdAt: Date;
    plaidAccessToken?: string; // Added Plaid access token
    plaidItemId?: string;      // Added Plaid item ID
    subscriptions: Subscription[]; // Added subscriptions array
    paymentMethods: PaymentMethod[]; // Added payment methods array
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interface for subscription objects
interface Subscription {
    service: string;
    status: 'active' | 'canceled' | 'paused';
    nextBilling: Date;
    paymentMethodId: string; // Reference to payment method
}

// Interface for payment methods
interface PaymentMethod {
    plaidItemId: string;
    lastFourDigits: string;
    institutionName: string;
    createdAt: Date;
}

const paymentMethodSchema = new Schema<PaymentMethod>({
    plaidItemId: { 
        type: String, 
        required: true,
        immutable: true
    },
    lastFourDigits: {
        type: String,
        required: true,
        match: [/^\d{4}$/, 'Last 4 digits must be 4 numbers']
    },
    institutionName: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
});

const subscriptionSchema = new Schema<Subscription>({
    service: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Service name cannot exceed 50 characters']
    },
    status: {
        type: String,
        enum: ['active', 'canceled', 'paused'],
        default: 'active'
    },
    nextBilling: {
        type: Date,
        required: true
    },
    paymentMethodId: {
        type: String,
        required: true,
        match: [/^pm_\w+$/, 'Invalid payment method ID format']
    }
});

const userSchema = new Schema<IUser>({
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Invalid email format'],
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [12, 'Password must be at least 12 characters'],
        select: false
    },
    firstName: { 
        type: String, 
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters'],
        match: [/^[a-zA-Z-' ]+$/, 'Invalid characters in first name']
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        immutable: true
    },
    plaidAccessToken: {
        type: String,
        select: false, // Never return access token in queries
        match: [/^access-sandbox-\w+$/, 'Invalid Plaid access token format']
    },
    plaidItemId: {
        type: String,
        index: true, // Add index for faster queries
        match: [/^item-sandbox-\w+$/, 'Invalid Plaid item ID format']
    },
    subscriptions: [subscriptionSchema],
    paymentMethods: [paymentMethodSchema]
});

// Existing password hashing middleware remains unchanged
userSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Existing comparePassword method remains unchanged
userSchema.methods.comparePassword = async function(
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = models.User || model<IUser>('User', userSchema);
