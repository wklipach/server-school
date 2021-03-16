var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var objectId = require("mongodb").ObjectID;
const connectionString =  require('../DB').connectionString;
const dbName =  require('../DB').dbName;

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
        // const result = await db.collection('listlessons').find({id_user: id_user}).toArray();
        return JSON.stringify(rsIns);
    } finally {
        client.close();
    }
}

async function asyncInsertCopyLesson(id_lesson) {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);
        const resLesson = await db.collection('listlessons').find({ _id: new objectId(id_lesson)}).toArray();
        const newLesson = {};

        if (resLesson.length > 0) {
            if (resLesson[0].id_user) {
                newLesson.id_user = resLesson[0].id_user;
            }
            if (resLesson[0].objSummaryLesson) {
                newLesson.objSummaryLesson = resLesson[0].objSummaryLesson;
                newLesson.objSummaryLesson.lessonTopic = 'Копия '+ newLesson.objSummaryLesson.lessonTopic;
            }
            if (resLesson[0].objSummaryLesson2) {
                newLesson.objSummaryLesson2 = resLesson[0].objSummaryLesson2;
            }
        }

        const rsIns = await db.collection('listlessons').insertOne(newLesson);
        return JSON.stringify(rsIns);
    } finally {
        client.close();
    }
}

async function asyncInsertManyLesson(arrResult) {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);
        const rsIns = await db.collection('listlessons').insertMany(arrResult);
        return JSON.stringify(rsIns);
    } finally {
        client.close();
    }
}

async function asyncLesson(id_lesson) {
    const client = await new MongoClient.connect(connectionString);
    try {
        id_lesson = id_lesson.replace(/"/g, '');
        const curID = new objectId(id_lesson);
        const db = client.db(dbName);
        const resLesson = await db.collection('listlessons').find({ _id: curID}).toArray();
        return JSON.stringify(resLesson);
    } catch (err) {
        return  err;
    } finally {
        client.close();
    }
}

async function asyncThemeLesson(id_lesson) {
    const client = await new MongoClient.connect(connectionString);
    try {
        id_lesson = id_lesson.replace(/"/g, '');
        const curID = new objectId(id_lesson);
        const db = client.db(dbName);
        const resLesson = await db.collection('listlessons').find({ _id: curID}, {fields: {'objSummaryLesson.documentTypeLesson': true}}).toArray();
        return JSON.stringify(resLesson);
    } catch (err) {
        return  err;
    } finally {
        client.close();
    }
}


async function asyncUpdateSummaryLesson(id_key, objSummaryLesson2) {
    const client = await new MongoClient.connect(connectionString);
    id_key = id_key.replace(/"/g, '');

    try {
        const db = client.db(dbName);
        const rsIns = await db.collection('listlessons').updateOne(
            { _id : objectId(id_key)},
            { $set:  {objSummaryLesson2}},
            {upsert: true}
        );
        return JSON.stringify(rsIns);
    } finally {
        client.close();
    }
}

async function asyncUpdateSummaryLesson_1(id_key, objSummaryLesson) {
    const client = await new MongoClient.connect(connectionString);
    id_key = id_key.replace(/"/g, '');
    try {
        const db = client.db(dbName);
        const rsIns = await db.collection('listlessons').updateOne(
            { _id : objectId(id_key)},
            { $set:  {objSummaryLesson}},
            {upsert: true}
        );
        return JSON.stringify(rsIns);
    } finally {
        client.close();
    }
}

async function asyncSelectLessonsUser(id_user, current_lessons, date, uLessonObjectives, uLessonTopic) {


    if (uLessonObjectives === 'nonestring') {
        uLessonObjectives = '';
    }

    if (uLessonTopic === 'nonestring') {
        uLessonTopic = '';
    }

    const client = await new MongoClient.connect(connectionString);
    id_user = id_user.replace(/"/g, '');


    // {"date": {"$gte": from_date, "$lt": to_date}}

    try {
        const db = client.db(dbName);

        let sSql = '';

        if (current_lessons === 'true') {
            let result = await db.collection('listlessons').find({$and: [{id_user: id_user}, 
                                                                   {"objSummaryLesson.formControlDate": {$gte: date}} ]})
                                                                   .sort({"objSummaryLesson.formControlDate": -1})
                                                                   .toArray();

            if (uLessonObjectives !== 'nonestring') {
                result = result.filter(e => {
                    return e.objSummaryLesson.lessonObjectives.indexOf(uLessonObjectives) > -1;
                });
            }
    
            if (uLessonTopic !== 'nonestring') {
                result = result.filter(e => {
                    return e.objSummaryLesson.lessonTopic.indexOf(uLessonTopic) > -1;
                });
            }


            return JSON.stringify(result);
        }

        if (current_lessons !== 'true') {

            const result = await db.collection('listlessons').find({$and: [{id_user: id_user}, {"objSummaryLesson.formControlDate": {$lte: date}} ]})
                                                             .sort({"objSummaryLesson.formControlDate": -1}).toArray();
            return JSON.stringify(result);
        }

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

async function asyncGroupLearningActivitiesMethod() {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);

        let classGroup = await db.collection("classGroupLearningActivities");
        const result = await
            classGroup.aggregate([
                    { $lookup: {
                            from:"classBasicLearningActivities",
                            localField:"id",
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

async function asyncGroupLearningActionsMethod() {
    const client = await new MongoClient.connect(connectionString);
    try {
        const db = client.db(dbName);

        let classGroup = await db.collection("classGroupLearningActions");
        const result = await
            classGroup.aggregate([
                    { $lookup: {
                            from:"classBasicLearningActions",
                            localField:"id",
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
        const result = await asyncSelectLessonsUser(req.query.id_user, 
                                                    req.query.current_lessons, 
                                                     req.query.date,
                                                     req.query.uLessonObjectives, 
                                                     req.query.uLessonTopic);
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

    if (req.query.get_learningactivities) {
        const result = await asyncGroupLearningActivitiesMethod();
        res.send(result);
    }

    if (req.query.get_learningactions) {
        const result = await asyncGroupLearningActionsMethod();
        res.send(result);
    }

    if (req.query.get_lesson) {
        const result = await asyncLesson(req.query.id_lesson);
        res.send(result);
    }

    if (req.query.get_theme_lesson) {
        const result = await asyncThemeLesson(req.query.id_lesson);
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

    if (req.body.insert_manylessons) {
        const result = await  asyncInsertManyLesson(req.body.arrResult);
        res.send(result);
    }

    if (req.body.insert_copylesson) {
        const result = await  asyncInsertCopyLesson(req.body.id_lesson);
        res.send(result);
    }


    if (req.body.update_summarylesson) {
        const result = await  asyncUpdateSummaryLesson(req.body.id_key, req.body.objSummaryLesson2);
        res.send(result);
    }

    if (req.body.update_summarylesson_1) {
        const result = await  asyncUpdateSummaryLesson_1(req.body.id_key, req.body.objSummaryLesson);
        res.send(result);
    }

});

module.exports = router;