
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

mongoose.connect("mongodb://localhost/storedata");
var UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number
});
var Users = mongoose.model('Users', UserSchema);


app.get('/', routes.index);
app.get('/users', function(req, res) {
    Users.find({}, function(err, docs) {
        res.render('users', {users: docs});
    });
});

app.get('/users/new', function(req, res) {
    res.render('users/new');
});

app.post('/users', function(req, res) {
    var b = req.body;
    new Users({
        name: b.name,
        email: b.email,
        phone: b.phone
    }).save(function(err, user) {
            if(err) res.json(err);
            res.redirect('/users/' + user.name);
        })
});

app.param('name', function(req, res, next, name) {
    Users.find({name:name}, function(err, docs) {
        req.user = docs[0];
        next();
    });
});
//SHOW
app.get('/users/:name', function(req, res) {
    res.render('users/show', {user:req.user});
});

//EDIT
app.get('/users/:name/edit', function(req, res){
    res.render('users/edit', { user:req.user});
});

//UPDATE
app.put('/users/:name', function(req, res) {
    var b = req.body;
        Users.update(
        { name: req.params.name },
        {name: b.name, age: b.age, phone: b.phone},
            function(err) {
                res.redirect('/users/' + b.name);
            }
    )
});

//DELETE
app.delete('/users/:name', function(req, res) {
    Users.remove({name:req.params.name}, function(err) {
        res.redirect('/users');
    })
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
