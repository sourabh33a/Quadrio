import mongoose from "mongoose";

const ComSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }

})

const feedSchema = new mongoose.Schema({
    name:String,
    email:String,
    text:String
})
const ItemSchema = new mongoose.Schema({
    name:String,
    text:String
})
export const Item = mongoose.model('Item',ItemSchema)
export const Com = mongoose.model('Com',ComSchema)
export const Feed = mongoose.model('Fed',feedSchema)
//eiVF2Wo1URZc98aN