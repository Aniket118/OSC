if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});



const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave :false,
    saveUninitialized : false
}))
app.use(methodOverride('_method'))


app.get('/',  (req, res) => {
    res.render('index.ejs', {name: req.query.name})
})

app.get('/login',(req, res) => {
    res.render('login.ejs')
})

app.post('/login', (req, res) => {
    email = req.body.email;
    const cursor = db.collection('details').find({email: email}).toArray(function(err, result) {
        if (err) throw err;
        console.log("result: ", result);
        try{
            if(bcrypt.compare(req.body.password, result[0].password)){
                res.redirect('/?name=' + result[0].name);
            }
            else{
                res.redirect('/login');
            }
        } catch(e){
            console.log(e);
        }
        db.close();
      });
})


app.get('/signup', (req, res) => {
    
    res.render('signup.ejs')
})


app.post('/signup', async (req, res) => {
    try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    var data = { 
        
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password : hashedPassword
    } 
    db.collection('details').insertOne(data,function(err, collection){ 
        if (err) throw err; 
        console.log("Record inserted Successfully"); 
        console.log();
              
    }); 

        res.redirect('/login')
    }
    catch {
        res.redirect('/signup')
         
    }
    console.log(users)
})


app.listen(3000)