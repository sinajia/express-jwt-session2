# Express client side session

`This is a distributed, content encryption, signed client side session implementation.`


# Usage

```js
const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-jwt-session2') // require express-jwt-session2
const app = express()

// "express-jwt-session2" relay "cookie-parser"
app.use(cookieParser())
//               Session ID   Your server side secret   Session timeout by millisecond
app.use(session('session_id', '%%ZHN1y^0lIVkQw#bT9n',   3600 * 24 * 1000,
{
  symmetric: true // If true, run AES algorithm before sign
}))
```

```js
const session = {
  id: 1,
  name: 'jy',
  avator: 'http://xxxx.com/xxx/xxxx/xxxx/xxxx.png',
  email: 'xxx@qq.com',
  wallet: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
}

// set or update session
res.reWriteSession(session).send('ok')
```

```js
// get session
console.log(req.session)
```


# Api

reWriteSession, method req.reWriteSession


# Other

wo use AES to encrypt.

wo use jsonwebtoken to sign and verify.
