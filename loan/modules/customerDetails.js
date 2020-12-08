var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/loan', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
var conn = mongoose.connection;
var userSchema = new mongoose.Schema({
    loanAmount: {
        type: String,
        required: true,
    },
    currentLocation: {
        type: String,
        required: true,
    },
    residenceType: {
        type: String,
        required: true,
    },
    eType: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true,
    },
    monthlyIncome: {
        type: String,
        required: true,
    },
    modeofSalary: {
        type: String,
        required: true
    },
    contactName: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: Number,
        max:9999999999,
        min:6000000000,
        required: true,
        index: {
            unique: true
        }
    },
    adharCard: 
    { 
        data: Buffer, 
        contentType: String 
    },
    panCard: 
    { 
        data: Buffer, 
        contentType: String 
    },
    blankCheque: 
    { 
        data: Buffer, 
        contentType: String 
    },
    interests: [],
    date: {
        type: Date,
        default: Date.now
    }
})
var customerModule = mongoose.model('customerdetails', userSchema)

module.exports = customerModule;  