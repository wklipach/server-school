var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const connectionString = 'mongodb://localhost:27017';
const dbName = 'schooldb';


async function asyncNewUser(newuser) {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);

        const curNewUser = await db.collection('tUser').insertOne(newuser);
        return JSON.stringify(curNewUser);
    } catch (err) {
        return  err;
    } finally {
        client.close();
    }
}

async function asyncEmailUser(sEmail) {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);
        const resEmail = await db.collection('tUser').find({$and: [{email: sEmail}, {bitdelete: false}]}).toArray();

        return JSON.stringify(resEmail.length);
    } catch (err) {
        return  err;
    } finally {
        client.close();
    }
}

async function asyncNickUser(sNick) {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);
        const resNick = await db.collection('tUser').find({$and: [{login: sNick}, {bitdelete: false}]}).toArray();
        console.log('resNick=', resNick.length);
        return JSON.stringify(resNick.length);
    } catch (err) {
        return  err;
    } finally {
        client.close();
    }
}

async function asyncUser(sUser) {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);
        const resUser = await db.collection('tUser').find(
                                                            {$and: [{bitdelete: false},
                                                                  {$or: [{login: sUser}, {email: sUser}]}
                                                            ]}).toArray();
        return JSON.stringify(resUser);
    } catch (err) {
        return  err;
    } finally {
        client.close();
    }
}



router.post('/', async function(req, res) {

    if (req.body.newuser) {
        const result = await asyncNewUser(req.body.newuser);
        res.send(result);
    }
});

/* GET users listing. */
router.get('/', async function(req, res, next) {

    if (req.query.get_email_user) {
        const emailUser = await asyncEmailUser(req.query.get_email_user);
        res.send(emailUser);
    }

    if (req.query.get_nick_user) {
        const nickUser = await asyncNickUser(req.query.get_nick_user);
        res.send(nickUser);
    }

    if (req.query.get_user) {
        const result = await asyncUser(req.query.get_user);
        res.send(result);
    }

});

module.exports = router;
