const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send({ status: true, Message: 'Sell Buy Laptop Server Is Running' })
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ujhfrio.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const userCollection = client.db("sell-buy-laptop").collection("user");
        const cetegoryCollection = client.db("sell-buy-laptop").collection("cetegorys");


        app.post('/user', async (req, res) => {
            try {
                const user = req.body;
                const query = { email: user.email }
                const findUser = await userCollection.findOne(query);
                if (findUser) {
                    return res.send({ status: false, message: 'User Already added a database' })
                }
                const result = await userCollection.insertOne(user);
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.get('/cetegorys', async (req, res) => {
            try {
                const result = await cetegoryCollection.find({}).toArray();
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })

        // app.get('/userupdate', async (req, res) => {
        //     const filter = {};
        //     const option = { upsert: true }
        //     const upDoc = {
        //         $set: {
        //             verified: 'false'
        //         }
        //     }
        //     const result = await userCollection.updateMany(filter, upDoc, option);
        //     res.send(result)
        // })




    }
    catch (error) {
        console.log(error)
    }
}
run().catch(e => console.log(e))


app.listen(port, () => {
    console.log('Server is Running', port)
})