const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// const sassMiddleware = require('node-sass-middleware');
const serveIndex = require('serve-index');
const fs = require('fs');

const workingFolder = path.join('./working');
const workingInput = path.join(workingFolder, 'input');
const workingOutput = path.join(workingFolder, 'output');

if (!fs.existsSync(workingFolder)) {
    fs.mkdirSync(workingFolder);
}
if (!fs.existsSync(workingInput)) {
    fs.mkdirSync(workingInput);
}
if (!fs.existsSync(workingOutput)) {
    fs.mkdirSync(workingOutput);
}

const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
// app.use(sassMiddleware({
//     src: path.join(__dirname, 'public'),
//     dest: path.join(__dirname, 'public'),
//     indentedSyntax: false, // true = .sass and false = .scss
//     sourceMap: false,
//     outputStyle: 'compressed',
// }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/working', express.static(path.join(__dirname, 'working')), serveIndex(path.join(__dirname, 'working'), {'icons': true}));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
