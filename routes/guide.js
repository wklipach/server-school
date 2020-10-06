var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const connectionString = 'mongodb://localhost:27017';
const dbName = 'schooldb';



async function asyncSelectCollection(collection_name) {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);
        const result = await db.collection(collection_name).find({}).toArray();
        return JSON.stringify(result);
    } finally {
        client.close();
    }
}



async function asyncCheckCollection(collection_name) {
    const client = await new MongoClient.connect(connectionString);
    try {
        let bCheck = false;
        const db = client.db(dbName);
        const arrayRes = await db.listCollections().toArray();

        for (index = 0; index < arrayRes.length; ++index) {
            console.log(arrayRes[index].name);
            if (arrayRes[index].name.toString() === collection_name.toString()) {
                console.log(arrayRes[index].name.toString(), collection_name.toString());
                bCheck = true;
                break;
            }
        }

        console.log('bCheck=', bCheck);
        return bCheck;

    } finally {
        client.close();
    }

}

async function asyncInsertLessonsName(collectionName, objLessonsName) {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);
        const rsIns = await db.collection(collectionName).insertMany(objLessonsName);
        const result = await db.collection(collectionName).find({}).toArray();
        return JSON.stringify(result);
    } finally {
        client.close();
    }
}

async function insertWithSelectGuide() {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);

        const stuff2 = await db.collection('Stuff5').insertMany([ {d : 'три1'}, {d : 'три2'}, {d : 'три3'} ]);

        const stuff = await db.collection("Stuff5").find({}).toArray();

        return JSON.stringify(stuff);
    } finally {
        client.close();
    }
}


router.get('/', async function(req, res, next) {

    if (req.query.get_collection_check) {
        const result = await asyncCheckCollection(req.query.collection_name);
        res.send(result);
    }

    if (req.query.get_collection_test) {
        const guideList = await insertWithSelectGuide();
        res.send(guideList);
    }

    if (req.query.get_collection) {
        const guideList = await asyncSelectCollection(req.query.collection_name);
        res.send(guideList);
    }


});


router.post('/', async function(req, res) {

    if (req.body.insert_lessonsName) {
        const result = await  asyncInsertLessonsName(req.body.collectionName, req.body.objLessonsName);
        res.send(result);
    }
});

module.exports = router;