const mongoose = require('mongoose')

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected")
    } catch (error) {
        console.log("Databse not connected")
    }
}

module.exports = {
    connectdb
}

