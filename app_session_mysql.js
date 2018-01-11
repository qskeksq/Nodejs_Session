var express = require('express');
var bodyParser = require('body-parser');

// 세션 값을 메모리에 저장해 두기 때문에 다시 실행하면 데이터가 모루 사라진다. 따라서 데이터베이스에 따로 저장해야 한다
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var MySQLStore = require('express-mysql-session')(session);
var app = express();

var options = {
   host: 'localhost',
   port: 3306,
   user: 'root',
   password: '*****',
   database: 'session'
};

// 미들웨어 설정
app.use(session({
    secret: 'pq4fp8h39hp3fh3f98',
    resave: false,          // 세션을 발급할 때마다 새 값으로 할 것인지
    saveUninitialized: true,
    store: new MySQLStore(options)
}));
app.use(bodyParser.urlencoded({extended : false}));


app.get('/auth/login',(req, res)=>{
    var output = `
    <h1>Login</h1>
    <form action="/auth/login" method="POST">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
    `
    res.send(output);
});

app.post('/auth/login', (req, res)=>{
    
    var user = {
        username : 'qskeksq',
        password : '*****',
        displayname : 'nadan'
    }
    
    var username = req.body.username;
    var pwd = req.body.password;
    
    if(user.username === username && user.password === pwd){
        // 세션에 이름값 저장
        req.session.displayname = user.displayname;
        res.redirect('/welcome');
    } else {
        res.send('who are you? <a href="/auth/login">login</a>');
    }

});

app.get('/welcome', (req, res)=>{

    if(req.session.displayname){
        res.send(
            `
            <h1>hello ${req.session.displayname} </h1>
            <a href="/auth/logout">logout</a>
            `)
    } else {
        res.send(
            `
            <h1>Welcome</h1>
            <a href="/auth/login">login</a>
            `)
    }
});

app.get('/auth/logout', (req, res)=>{
    delete req.session.displayname;
    res.redirect('/welcome');
});

app.listen(3000, function(){
    console.log('server is running');
});