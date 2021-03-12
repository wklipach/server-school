var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const objectId = require("mongodb").ObjectID;
const connectionString =  require('../DB').connectionString;
const dbName =  require('../DB').dbName;

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

async function asyncSchoolUsers(school, fio, slogin) {

    if (!fio && slogin) {
        fio = 'nonestring';
    }

    if (fio && !slogin) {
        slogin = 'nonestring';
    }

    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);
        //const resUsers = await db.collection('tUser').find({$and: [{email: sEmail}, {bitdelete: false}]}).toArray();
        const resUsers = await db.collection('tUser').find(
            {
                $and:[ {$or:[{fio: {$regex: fio}}, {login: {$regex: slogin}}]},
                    {organization: school},
                    {bitdelete: false}
                ]
            }
        ).toArray();

        return JSON.stringify(resUsers);
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

async function asyncUserID(mongoID) {
    const client = await new MongoClient.connect(connectionString);
    try {
        mongoID = mongoID.replace(/"/g, '');
        const curID = new objectId(mongoID);
        const db = client.db(dbName);
        const resUser = await db.collection('tUser').find({ _id: curID}).toArray();
        return JSON.stringify(resUser);
    } catch (err) {
        return  err;
    } finally {
        client.close();
    }
}


// db.tUser.find({ $and: [    {bitdelete: false}, {bitdelete: {$ne: true}}   ]})
async function asyncUserWithoutCurrentID(mongoID) {
    const client = await new MongoClient.connect(connectionString);
    try {
        mongoID = mongoID.replace(/"/g, '');
        const curID = new objectId(mongoID);
        const db = client.db(dbName);
        const resUser = await db.collection('tUser')
                                            .find({ $and: [ {bitdelete: false}, {_id: {$ne: curID}} ]}).toArray();

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

    if (req.query.get_user_school) {
        const schoolUsers = await asyncSchoolUsers(req.query.school, req.query.fio, req.query.slogin);
        res.send(schoolUsers);
    }

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

    if (req.query.get_user_id) {
        const result = await asyncUserID(req.query.get_user_id);
        res.send(result);
    }

    if (req.query.get_user_withoutcurrentid) {
        const result = await asyncUserWithoutCurrentID(req.query.id_user);
        res.send(result);
    }



});

module.exports = router;
