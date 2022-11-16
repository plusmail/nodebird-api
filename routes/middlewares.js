const jwt = require('jsonwebtoken');

const RateLimit = require('express-rate-limit');

exports.apiLimiter = RateLimit({
    windowMs : 1*100,
    max : 100,
    delayMs : 0,
    handler(req, res){
        res.status(this.statusCode).json({
            code : this.statusCode,
            message : '1초에 한번만 요청할 수 있습니다. 추가 요금 필요',
        })
    }
});
exports.deprecated = (req, res) => {
    res.status(410).json({
        code : 410,
        message : "새로운 버전이 나왔으니 추후 2022/12/31이후 이쪽은 접근 하지 마시오.",
    });
};


exports.verifyToken = (req, res, next) => {
    try {
        // console.log(req.headers.authorization);
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        return next();
    }catch (error) {
        if( error.name === 'TokenExpiredError') {
            return  res.status(419).json({
                code : 419,
                message : '토큰이 만료되었습니다.',
            });
        }
        return res.status(401).json({
            code : 401,
            message : '유효하지 않은 토큰입니다.',
        });
    }
};

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send('로그인 필요');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
    }
};
