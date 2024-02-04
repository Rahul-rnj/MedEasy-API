import mongoose from "mongoose";

const dbConnect = async()=>{
    try{
        mongoose.set('strictQuery',false)
        const connected = await mongoose.connect('mongodb+srv://Rahul-rnj:Rahul123@medeasy-api.ulpbtoc.mongodb.net/');
        console.log(`Mongodb connected ${(connected).connection.host}`)
    }catch(error) {
        console.log(`Error ${error.message}`);
        process.exit(1);
    }
};

export default dbConnect;

//Rahul123