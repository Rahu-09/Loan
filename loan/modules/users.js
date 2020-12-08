var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/loan', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
var conn = mongoose.connection;
var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})
var userModule = mongoose.model('user', userSchema)

module.exports = userModule;     