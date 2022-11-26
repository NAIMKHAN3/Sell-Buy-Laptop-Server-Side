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
        const wishListCollection = client.db("sell-buy-laptop").collection("wishList");
        const reportProductsCollection = client.db("sell-buy-laptop").collection("reportproducts");
        const bookingCollection = client.db("sell-buy-laptop").collection("booking");


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

        app.post('/addwishlist', async (req, res) => {
            try {
                const wishListProduct = req.body;
                const filter = { wishlistUser: wishListProduct.wishlistUser, productId: wishListProduct.productId }
                const findWishList = await wishListCollection.findOne(filter);


                if (findWishList) {
                    return res.send({ status: false, message: "That Product Already Added Your My WishList" })
                }
                const result = await wishListCollection.insertOne(wishListProduct);
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.post('/addmybooking', async (req, res) => {
            try {
                const myBooking = req.body;
                const filter = { useremail: myBooking.useremail, productId: myBooking.productId }
                const findUserBooking = await bookingCollection.findOne(filter);


                if (findUserBooking) {
                    return res.send({ status: false, message: "Already that Product booked You" })
                }
                const result = await bookingCollection.insertOne(myBooking);
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.post('/addreportproduct', async (req, res) => {
            try {
                const reportProduct = req.body;
                const filter = { reporteduser: reportProduct.reporteduser, productId: reportProduct.productId }
                const findreportproduct = await reportProductsCollection.findOne(filter);

                if (findreportproduct) {
                    return res.send({ status: false, message: "That Product Already Added Report To Admin" })
                }
                const result = await reportProductsCollection.insertOne(reportProduct);
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })

        app.get('/allreportitem', async (req, res) => {
            try {
                const result = await reportProductsCollection.find({}).toArray();
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
        app.get('/userwishlist', async (req, res) => {
            try {
                const email = req.query.email;
                const filter = { wishlistUser: email }
                const result = await wishListCollection.find(filter).toArray();
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.get('/userproduct', async (req, res) => {
            try {
                const email = req.query.email;
                const filter = { selleremail: email }
                const result = await productsCollection.find(filter).toArray();
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
        app.get('/productstatus', async (req, res) => {
            try {
                const id = req.query.id;
                const query = { _id: ObjectId(id) }
                const result = await productsCollection.findOne(query);
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
        app.get('/alluser', async (req, res) => {
            try {
                const query = {}
                const result = await userCollection.find(query).toArray();
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.get('/adverticeproduct', async (req, res) => {
            try {
                const query = { advertice: 'true', status: 'true' }
                const result = await productsCollection.find(query).toArray();
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.put('/verifyuser', async (req, res) => {
            try {
                const id = req.query.id;
                const filter = { _id: ObjectId(id) };
                const option = { upsert: true }
                const upDoc = {
                    $set: {
                        verified: 'true'
                    }
                }
                const result = await userCollection.updateOne(filter, upDoc, option);
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.put('/makeadmin', async (req, res) => {
            try {
                const id = req.query.id;
                const filter = { _id: ObjectId(id) };
                const option = { upsert: true }
                const upDoc = {
                    $set: {
                        role: 'admin'
                    }
                }
                const result = await userCollection.updateOne(filter, upDoc, option);
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.put('/updateproduct', async (req, res) => {
            try {
                const id = req.query.id;
                const find = await productsCollection.findOne({ _id: ObjectId(id) });
                if (find.advertice === 'true') {
                    return res.send({ status: false, message: `Already ${find.brand} ${find.model} Added avertice` })
                }
                const filter = { _id: ObjectId(id) };
                const option = { upsert: true }
                const upDoc = {
                    $set: {
                        advertice: 'true'
                    }
                }
                const result = await productsCollection.updateMany(filter, upDoc, option);
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })

        app.delete('/deletereport', async (req, res) => {
            const id = req.query.id;
            const email = req.query.email;
            // const productId = req.query.productId
            // const query = { productId: productId, selleremail: email }
            // const deleted = await wishListCollection.deleteOne(query);
            // console.log(deleted)
            const filter = { _id: ObjectId(id) }
            const result = await reportProductsCollection.deleteOne(filter);
            res.send(result)
        })

        app.delete('/deleteproduct', async (req, res) => {
            const id = req.query.id;
            const filter = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(filter);
            res.send(result)
        })

        app.delete('/deleteuser', async (req, res) => {
            const id = req.query.id;
            const filter = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(filter);
            res.send(result)
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