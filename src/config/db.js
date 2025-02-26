import mongoose from 'mongoose';
import 'dotenv/config'

const mongoconnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_CONNECT_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error in connecting to the database:", err);
    }
};

export default mongoconnect;
