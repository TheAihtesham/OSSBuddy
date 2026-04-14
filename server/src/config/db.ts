import mongoose from 'mongoose'

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI!, {
            dbName: 'OSSBuddy'
        });
        console.log('MongoDB connected');
    }catch(err: any){
        console.error('Error while connecting', err.message);
        process.exit(1);
    }
};

export default connectDB;