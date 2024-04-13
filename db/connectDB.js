import mongoose from "mongoose";

const connectDB = async (URL) => {
    try {
        const DB_OPTIONS = {
            dbName : "PahadiTadka",
        };
        await mongoose.connect(URL , DB_OPTIONS);
        console.log("Database Connected Successfully")
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message : "internal server error connectDB"});
    };
};

export default connectDB;