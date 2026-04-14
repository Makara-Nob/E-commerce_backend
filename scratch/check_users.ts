import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || '';

mongoose.connect(uri).then(async () => {
    // We only need the User schema structure to query it
    const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
    const User = mongoose.model('UserTemp', userSchema);
    
    // Sort by _id descending to get the most recent ones
    const recentUsers = await User.find({}).sort({ _id: -1 }).limit(3);
    console.log('--- RECENT USERS ---');
    recentUsers.forEach(u => {
        console.log(`Email: ${u.get('email')}, Status: ${u.get('status')}, OTP: ${u.get('otp')}, Created: ${u.get('createdAt')}`);
    });
    
    mongoose.disconnect();
}).catch(console.error);
