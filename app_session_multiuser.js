var express = require('express');
var bodyParser = require('body-parser');

// 세션 값을 메모리에 저장해 두기 때문에 다시 실행하면 데이터가 모루 사라진다. 따라서 데이터베이스에 따로 저장해야 한다
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var app = express();

// 미들웨어 설정
app.use(session({
    key: '*****',
    secret: 'a',
    resave: false,          // 세션을 발급할 때마다 새 값으로 할 것인지
    saveUninitialized: true,
    cookie: {
        maxAge: 24000 * 60 * 60,
        secure: false
    }
    // store: new FileStore()
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
    
    var username = req.body.username;
    var pwd = req.body.password;

    for(var i=0; i<users.length; i++){
        var user = users[i];
        if(user.username === username && user.password === pwd){
            // 세션에 이름값 저장
            req.session.displayname = user.displayname;
            // 세션 데이터가 저장된 후 호출
            return req.session.save(function(){
                // 리턴으로 for문을 중지한다
                res.redirect('/welcome');
            });
        }
    }
    // 사용자가 없는 것임
    res.send('who are you? <a href="/auth/login">login</a>');
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
            <ul>
                <li><a href="/auth/login">login</a></li>
                <li><a href="/auth/register">Register</a></li>
            </ul>
            `)
    }
});

app.get('/auth/register', (req, res)=>{
    var output=
    `
    <h1>Register</h1>
    <form action="/auth/register" method="POST">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
            <input type="text" name="displayname" placeholder="displayname">
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
    `
    res.send(output);
});

var users = [
    {
        username : 'qskeksq',
        password : '*****',
        displayname : 'nadan'
    }

]

app.post('/auth/register', (req, res)=>{
    var user = {
        username : req.body.username,
        password : req.body.password,
        displayname : req.body.displayname
    }

    /**
     * 기존 사용자 확인
     * 비밀번호 확인
     * 비밀번호 이중 체크
     */
    users.push(user);
    req.session.displayname = req.body.displayname;
    req.session.save(function(){
        // 리턴으로 for문을 중지한다
        res.redirect('/welcome');
    });
});

app.get('/auth/logout', (req, res)=>{
    delete req.session.displayname;
    res.redirect('/welcome');
});

app.listen(3000, function(){
    console.log('server is running');
});