var express = require('express');
var router = express.Router();
var Handlebars = require('hbs')
var bodyParser = require('body-parser');
var fs = require('fs');
var multer = require('multer');
var path = require('path');
var userModule = require('../modules/users')
var customerModule = require('../modules/customerDetails')
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const { throws } = require('assert');
require('dotenv/config');

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

function checkLoginUser(req, res, next) {
  let userToken = localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'LoginToken');
  } catch (err) {
    res.redirect('/');
  }
  next();
}

function Unamecheck(req, res, next) {
  var username = req.body.uname;
  var checkUname = userModule.findOne({ username: username });
  checkUname.exec((err, data) => {
    if (err) throw err;
    if (data) {
      return next();
    }
    res.render('index', { title: 'Password Management System', msg: "Incorrect User Name" });
  })
}

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

router.get('/', function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) { res.redirect('/customer') }
  else { res.render('index', { title: 'Personal Loan', msg: '' }); }
});

router.post('/', Unamecheck, function (req, res, next) {
  var userName = req.body.uname;
  var password = req.body.password;
  var checkUser = userModule.findOne({ username: userName });
  checkUser.exec((err, data) => {
    if (err) throw err;
    var getUserId = data._id;
    var getPassword = data.password;
    if (bcrypt.compareSync(password, getPassword)) {
      var token = jwt.sign({ userId: getUserId }, 'LoginToken');
      localStorage.setItem('userToken', token);
      localStorage.setItem('loginUser', userName);
      res.redirect('/customer');
    }
    else { res.render('index', { title: 'Personal Loan', msg: 'Incorrect Password' }); }
  });
});

router.get('/customer', checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  res.render('customer', { title: 'Personal Loan', msg: '', login: loginUser });
});


router.post('/customer', checkLoginUser, function (req, res, next) {
  var loanAmount = req.body.required_la;
  var currentLocation = req.body.current_location_c;
  var residenceType = req.body.resi_type;
  var eType = req.body.employment_type_c;
  var companyName = req.body.company_name;
  var monthlyIncome = req.body.net_salary;
  var modeofSalary = req.body.mode_of_salary;
  var contactName = req.body.contact_name;
  var mobileNumber = req.body.contact_mobile_no;
  var customerDetails = new customerModule({
    loanAmount: loanAmount,
    residenceType: residenceType,
    eType: eType,
    companyName: companyName,
    monthlyIncome: monthlyIncome,
    modeofSalary: modeofSalary,
    contactName: contactName,
    mobileNumber: mobileNumber,
    currentLocation: currentLocation
  })
  customerDetails.save((err, data) => {
    if (err) throw err;
    res.render('customer', { title: 'Personal Loan', msg: 'User Registered Successfully' });
  })
});

router.get('/admin', checkLoginUser, function (req, res, next) {
  var customer_Details = customerModule.find({});
  customer_Details.exec((err, doc) => {
    if (err) throw err;
    res.render('admin', { title: 'Customer Details', msg: '', records: doc });
  });
});

router.post('/admin/:search', checkLoginUser, function (req, res, next) {
  var customer_Details = customerModule.find({});
  var name = req.params.search;
  if (name != "EMPTY") {
    var search = customerModule.find({ "contactName": { '$regex': `.*${name}.*` } })
    search.exec((err, doc) => {
      if (err) throw err;
      return res.send({ title: 'Customer Details', msg: '', records: doc })
    })
  }
  else {
    customer_Details.exec((err, doc) => {
      if (err) throw err;
      return res.send({ title: 'Customer Details', msg: '', records: doc })
    })
  }
});

router.get('/details/:id', function (req, res, next) {
  Handlebars.registerHelper("noop", function (val, options) {
    if (val == "{}") {
      console.log(options.inverse(this))
      return options.inverse(this);
    }
    else {
      console.log(options.fn(this))
      return options.fn(this);
    }
  });
  var id = req.params.id;
  var customer_Details = customerModule.find({ "_id": id });
  var loginUser = localStorage.getItem('loginUser');
  customer_Details.exec((err, doc) => {
    if (err) throw err;
    res.render('details', { title: 'Customer Details', msg: '', login: loginUser, records: doc, interest:doc.interests });
  })
})

router.post('/:id/interest', function (req, res, next) {
  var id = req.params.id;
  console.log(req.body)
  var customer_Details = customerModule.findByIdAndUpdate({ "_id": id }, {
    interests:req.body.interest,
  });
  customer_Details.exec((err, data) => {
    if (err) throw err;
    res.redirect(`/details/${id}`)
  })
})

router.post('/details/adharCard/:id', upload.single('AdharCard'), function (req, res, next) {
  var id = req.params.id;
  var img = req.file.filename;
  var customer_Details = customerModule.findByIdAndUpdate({ "_id": id }, {
    adharCard: img,
  });
  customer_Details.exec((err, data) => {
    if (err) throw err;
    res.redirect(`/details/${id}`)
  })
});

router.post('/details/panCard/:id', upload.single('PanCard'), function (req, res, next) {
  var id = req.params.id;
  var img = req.file.filename;
  var customer_Details = customerModule.findByIdAndUpdate({ "_id": id }, {
    panCard: img,
  });
  customer_Details.exec((err, data) => {
    if (err) throw err;
    res.redirect(`/details/${id}`)
  })
});

router.post('/details/blankCheque/:id', upload.single('BlankCheque'), function (req, res, next) {
  var id = req.params.id;
  var img = req.file.filename;
  var customer_Details = customerModule.findByIdAndUpdate({ "_id": id }, {
    blankCheque: img,
  });
  customer_Details.exec((err, data) => {
    if (err) throw err;
    res.redirect(`/details/${id}`)
  })
});

router.get('/signup', function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) { res.redirect('/customer') }
  else { res.render('signup', { title: 'Personal Loan', msg: '' }); }
});

router.post('/signup', function (req, res, next) {
  var userName = req.body.uname;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confpassword;

  if (password != confpassword) {
    res.render('signup', { title: 'Password Management System', msg: 'Password Not Matched' });
  }
  else {
    password = bcrypt.hashSync(password, 10)
    var userDetails = new userModule({
      username: userName,
      email: email,
      password: password,
    })
    userDetails.save((err, data) => {
      if (err) throw err;
      res.render('signup', { title: 'Personal Loan', msg: 'User Registered Successfully' });
    })
  }
});

router.get('/logout', function (req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});

module.exports = router;
