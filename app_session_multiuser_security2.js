var express = require('express');
var bodyParser = require('body-parser');

// 세션 값을 메모리에 저장해 두기 때문에 다시 실행하면 데이터가 모루 사라진다. 따라서 데이터베이스에 따로 저장해야 한다
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var md5 = require('md5');
var sha256 = require('sha256');
var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();
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
        if(user.username === username){
            // 해시화 과정을 통해서 입력된 값과 DB에 저장된 salt값의 조합의 암호화 값이, 
            // 비밀번호를 만들면서 조합한 암호화 값과 같은지 확인 
            return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
                // 값이 같으면
                if(hash === user.password){
                    // 세션에 값 저장
                    req.session.displayname = user.displayname;
                    // 저장된 후 
                    req.session.save(function(){
                        res.redirect('/welcome')
                    });
                } else {
                    res.send('who are you? <a href="/auth/login">login</a>');                }
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
        password : 'TbW6gj2gGj6SDZ7sdF55nSjV28qTyJV1ItlGJgmPHqRwy16tb9rXGSRsar8XWTRkWf1kE9UwZ6ueCfWtFWYWssq'
                    +'nReKNq/1iec2gA8S7k4fOybADzNbLGcRp1s8CIfGYDSJ8s/RNrhBeYa3/OiGgG0XOq4dVqLpMoQO9Y54xBT4=',
        salt = "qpcgXYJUcGRFH/3wIpQb85ztCwB/7NxrZVbkc8lg2lBvuLJRoXbow5lYi5KSVjQdqZ+N1PMkoYOkikwfHSp+Eg==",
    
        displayname : 'nadan'
    }
]

app.post('/auth/register', (req, res)=>{
    hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
            username : req.body.username,
            password : hash,
            salt : salt,
            displayname : req.body.displayname
        }
        users.push(user);
        // 바로 로그인하기 위해 로그인 이력을 미리 남겨둔다
        req.session.displayname = req.body.displayname;
        // 세션이 저장된 후 res할 수 있다
        req.session.save(function(){
            // 리턴으로 for문을 중지한다
            res.redirect('/welcome');
        });
    });
});

app.get('/auth/logout', (req, res)=>{
    delete req.session.displayname;
    res.redirect('/welcome');
});

app.listen(3000, function(){
    console.log('server is running');
});