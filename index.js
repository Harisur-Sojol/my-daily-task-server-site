const express = require("express");
const cors = require("cors");

const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const req = require("express/lib/request");
const res = require("express/lib/response");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ptx5l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect()
        const database = client.db("my_daily_task")
        const taskCollection = database.collection('tasks')

        // Get Task Api
        app.get('/tasks', async (req, res)=> {
            const cursor = taskCollection.find({});
            const tasks = await cursor.toArray();
            res.send(tasks);
        })

        // Post/Add Task
        app.post('/addingTask', async (req, res)=> {
            const task = req.body;
            const result = taskCollection.insertOne(task);
            console.log(req)
            res.json(result);
        })


        // Put/Update Task
        app.put("/singleTask/:id", async (req, res) => {
            const id = req.params.id;
            const updateTask = req.body
            const filter = { _id: ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {
                $set: {
                    name: updateTask.name,
                    description: updateTask.description
                  },
            };
            const result = await taskCollection.updateOne(filter, updateDoc, options)
            res.json(result);
          });

        // Delete Task
        app.delete("/deleteTask/:id", async (req, res)=> {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.json(result) 
        })

    }
    finally{
        // await client.close()
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('running may curd server')
})

app.listen(port,() => {
    console.log('running server on port', port);
})