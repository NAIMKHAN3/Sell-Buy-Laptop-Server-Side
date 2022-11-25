const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const productsCollection = client.db("sell-buy-laptop").collection("products");


        app.post('/product', async (req, res) => {
            try {
                const product = req.body;
                const result = await productsCollection.insertOne(product);
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
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
        app.get('/cetegoryitem/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: ObjectId(id) }
                const cetegory = await cetegoryCollection.findOne(query);
                if (!cetegory) {
                    return
                }
                const cetegoryName = cetegory.name;
                const filter = { brand: cetegoryName };
                const cetegoryItem = await productsCollection.find(filter).toArray();
                res.send(cetegoryItem)

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
        app.get('/userverified', async (req, res) => {
            try {
                const email = req.query.email;
                const query = { email: email }
                const result = await userCollection.findOne(query);
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })

        app.get('/allbuyer', async (req, res) => {
            try {
                const query = { role: 'buyer' }
                const result = await userCollection.find(query).toArray();
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.get('/allseller', async (req, res) => {
            try {
                const query = { role: 'seller' }
                const result = await userCollection.find(query).toArray();
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })


        // // app.get('/userupdate', async (req, res) => {
        // //     const filter = {};
        // //     const option = { upsert: true }
        // //     const upDoc = {
        // //         $set: {
        // //             status: 'true'
        // //         }
        // //     }
        // //     const result = await productsCollection.updateMany(filter, upDoc, option);
        // //     res.send(result)
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