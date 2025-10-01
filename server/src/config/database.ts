import mongoose from "mongoose";

const connectDB= async()=>
{
    try
   { 
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Database connected");
}
catch(e)
{
    console.log("error connecting to database",e);
}
};

export {connectDB};