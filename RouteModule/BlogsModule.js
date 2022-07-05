const mongoose = require('mongoose');
const Blogsschema = new mongoose.Schema({
    username:{
        type: String,
        required: [true, 'a blog must have a user name'],
        unique: true,
        trim: true,
    },
    blogpost:{
        type: String,
    },
    title:{
        type: String,
        required: [true, 'a blog must have a title'],
    },
    time:{
        type: Date
    }
})

const Blogs = mongoose.model('Blogs', Blogsschema)
// console.log(Product);
module.exports = Blogs;