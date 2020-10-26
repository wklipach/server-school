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
            if (arrayRes[index].name.toString() === collection_name.toString()) {
                bCheck = true;
                break;
            }
        }
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

async function asyncInsertSummaryLesson(id_user, objSummaryLesson) {
    const client = await new MongoClient.connect(connectionString);
    id_user = id_user.replace(/"/g, '');

    try {
        const db = client.db(dbName);
        const rsIns = await db.collection('listlessons').insertOne({id_user, objSummaryLesson});
        const result = await db.collection('listlessons').find({id_user: id_user}).toArray();
        return JSON.stringify(result);
    } finally {
        client.close();
    }
}


async function asyncSelectLessonsUser(id_user) {
    const client = await new MongoClient.connect(connectionString);
    id_user = id_user.replace(/"/g, '');

    try {
        const db = client.db(dbName);
        const result = await db.collection('listlessons').find({id_user: id_user}).toArray();
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


async function asyncGroupInnerMethod() {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);

        let classGroupMethod = await db.collection("classGroupMethod");
        let classMethod = await db.collection("classMethod");

        const result = await
            classGroupMethod.aggregate([
                { $lookup: {
                        from:"classMethod",
                        localField:"id_group",
                        foreignField:"id_group",
                        as:"new_document"
                    } }
            ]
        ).toArray();

        return JSON.stringify(result);
    } finally {
        client.close();
    }
}

/*
db.comments.aggregate({
    $lookup:{
        from:"users",
        localField:"uid",
        foreignField:"uid",
        as:"users_comments"
    }
})
*/


router.get('/', async function(req, res, next) {

    if (req.query.get_collection_check) {
        const result = await asyncCheckCollection(req.query.collection_name);
        res.send(result);
    }

     if (req.query.get_lessons_user) {
        const result = await asyncSelectLessonsUser(req.query.id_user);
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

    if (req.query.get_groupinnermethod) {
        const result = await asyncGroupInnerMethod();
        res.send(result);
    }

});


router.post('/', async function(req, res) {

    if (req.body.insert_lessonsName) {
        const result = await  asyncInsertLessonsName(req.body.collectionName, req.body.objLessonsName);
        res.send(result);
    }

    if (req.body.insert_summarylesson) {
        const result = await  asyncInsertSummaryLesson(req.body.id_user, req.body.objSummaryLesson);
        res.send(result);
    }

});

module.exports = router;