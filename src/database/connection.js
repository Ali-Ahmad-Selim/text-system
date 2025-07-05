import mongoose from "mongoose"

export function connection() {
    const mongo = process.env.MONGO_URI
    
    if (!mongo) {
        console.log("MONGO_URI environment variable is not defined")
        return
    }
    
    if (mongoose.connections[0].readyState) {
        console.log("Already connected to MongoDB")
        return
    }
    
    mongoose.connect(mongo)
        .then(() => console.log("Connection is successful"))
        .catch((error) => console.log("Connection is unsuccessful:", error))
}
