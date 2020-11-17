var express = require('express');
var router = express.Router();
// import { SMTPClient, Message } from 'emailjs';
var Message = require('emailjs').Message;
var SMTPClient = require('emailjs').SMTPClient;
var connectionSMTP = require('../SMTPServer');
var MongoClient = require('mongodb').MongoClient;
const connectionString =  require('../DB').connectionString;
const dbName =  require('../DB').dbName;



function sendMessage(sMailTo, sPwd) {

    console.log('a1');
    const client = new SMTPClient({
        user: connectionSMTP.user,
        password: connectionSMTP.password,
        host: connectionSMTP.host,
        port: connectionSMTP.port,
        ssl: connectionSMTP.ssl
    });

    console.log('a2');

    const message = new Message({
        text: 'ваш новый пароль ',
        from: connectionSMTP.userForFromLetter,
        to: sMailTo,
        subject: connectionSMTP.subject,
        attachment:
            [
                {data:"<html>Ваш новый пароль: "+sPwd+"</html>", alternative:true}
            ]
    });

    console.log('a3');

    client.send(message, (err, message) => {
        console.log(err || message);
    });

}

async function asyncNewPasswordSend (hash, email, pwd) {

    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);
        //const curNewUser = await db.collection('tUser').update({_id: ObjectId("562dbdc57d0175ee0f8b4569")}, {$set: {password: hash}});
        const curUpdateUser = await db.collection('tUser').update({email: email}, {$set: {password: hash}});
        //2TA2qanMSQba

        sendMessage(email, pwd);

        console.log('email=', email, 'pwd=',  pwd, 'hash=', hash);

        return JSON.stringify(curUpdateUser);
    } catch (err) {
        return  err;
    } finally {
        client.close();
    }
}


router.post('/', async function(req, res) {
    if (req.body['email'] && req.body['pwd'] && req.body['hash']) {
        const result = await asyncNewPasswordSend(req.body['hash'], req.body['email'], req.body['pwd']);
        res.send(result);
    }
});

router.get('/', function(req, res, next) {
    res.send(JSON.stringify(res));
});


module.exports = router;