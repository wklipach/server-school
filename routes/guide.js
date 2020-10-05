var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const connectionString = 'mongodb://localhost:27017';


async function insertWithSelectGuide() {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db("schooldb");

        const stuff2 = await db.collection('Stuff5').insertMany([ {d : 'три1'}, {d : 'три2'}, {d : 'три3'} ]);

        const stuff = await db.collection("Stuff5").find({}).toArray();

        return JSON.stringify(stuff);
    } finally {
        client.close();
    }
}


router.get('/', async function(req, res, next) {

    const guideList = await
        insertWithSelectGuide();
    res.send(guideList);

});
module.exports = router;