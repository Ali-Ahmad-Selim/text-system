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
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
})

const model = mongoose.models.user || mongoose.model("user", Schema)

export default model
