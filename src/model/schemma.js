import mongoose from "mongoose"

const Schema = new mongoose.Schema({
    username: String,
    email: {
        type: String,
        required: [true, "email is required"]
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: 6
    }
})

const model = mongoose.models.user || mongoose.model("user", Schema)

export default model
