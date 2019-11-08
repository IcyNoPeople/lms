const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mydatabase = require('./database');
const session = require('express-session');

const adminPage = require('./admin');
const staffPage = require('./staffPage')
//const {addCustomerPage, addCustomer} = require('./adding');
//const {adminPage, viewTable, editTable, editPage} = require('./admin');

const {
  promisify,
} = require('util');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views/'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use('/admin',adminPage);
app.use('/staff',staffPage);


//global.mydatabase = mydatabase;



app.get('/', (req, res) => {
  // Education staff: 30000004, admin: 30000025, double access: 30000024, Corporate: 30000013, personal 30000008
  req.session.sta_id = '30000024';
  req.session.admin = true;
  req.session.staff = true;
  req.session.loggedin = true;
  

  
  try {
    
    res.render('home', {
    });
  } catch (err) {
    console.log('SQL error', err);
    res.status(500).send('Something went wrong');
  }
  res.end();
});
//app.get('/addCustomer',addCustomerPage);
//app.post('/addCustomer',addCustomer);
app.get('/demo', (req, res) => {
  res.render('demoProfile', {
  });
});

var server = app.listen(80, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})


 