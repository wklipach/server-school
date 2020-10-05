var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const connectionString = 'mongodb://localhost:27017';


/* GET home page. */
router.get('/', function(req, res, next) {
/*
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db("schooldb");
        const stuff2 = await db.collection('Stuff5').insertMany([ {a : 'раз1'}, {a : 'раз2'}, {a : 'раз3'} ]);
        console.log('a4');
        const stuff = await db.collection("Stuff5").find({}).toArray();
       // console.log('stuff',stuff);
        res.send(JSON.stringify(stuff));
    } finally {
        client.close();
    }
*/
  res.render('index', { title: 'Express' });
});

module.exports = router;
