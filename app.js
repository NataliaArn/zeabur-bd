var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var mysql = require('mysql');
const dbConfig = require('./dbconfig'); // Import database configuration


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const connection = mysql.createConnection(dbConfig);


// Connect to MySQL
connection.connect((err) => {
  if (err) {
      console.error('Error connecting to database:', err);
      return;
  }
  console.log('Connected to database!');
});


// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.get('/', (req, res) => {
  // Retrieve data from "ho" table
  connection.query('SELECT * FROM ho', (errorHo, resultsHo) => {
      if (errorHo) {
          console.error('Error retrieving data from "ho" table:', errorHo);
          res.status(500).send('Internal Server Error');
          return;
      }

      // Log the retrieved data from "ho" table
      console.log('Data from "ho" table:', resultsHo);

      // Retrieve data from "la" table
      connection.query('SELECT * FROM la', (errorLa, resultsLa) => {
          if (errorLa) {
              console.error('Error retrieving data from "la" table:', errorLa);
              res.status(500).send('Internal Server Error');
              return;
          }

          // Log the retrieved data from "la" table
          console.log('Data from "la" table:', resultsLa);

          // Render the template with the retrieved data
          res.render('index', { hoData: resultsHo, laData: resultsLa });
      });
  });
});

module.exports = app;
