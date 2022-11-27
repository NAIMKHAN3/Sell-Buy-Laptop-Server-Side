const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SK);
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken")
const token = process.env.ACCESS_TOKEN;



app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send({ status: true, Message: 'Sell Buy Laptop Server Is Running' })
})


function verifyJWT(req, res, next) {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
    })

    next();
}



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
        const paymentCollection = client.db("sell-buy-laptop").collection("payment");


        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }
        const verifyBuyer = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'buyer') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }
        const verifySeller = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'seller') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }


        app.post('/product', verifyJWT, verifySeller, async (req, res) => {
            try {
                const product = req.body;
                const result = await productsCollection.insertOne(product);
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })

        app.post('/addwishlist', verifyJWT, verifyBuyer, async (req, res) => {
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
        app.post('/addmybooking', verifyJWT, verifyBuyer, async (req, res) => {
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
        app.post('/payment', verifyJWT, verifyBuyer, async (req, res) => {
            try {
                const payment = req.body;
                const { productId, bookingId } = payment;
                const result = await paymentCollection.insertOne(payment);
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot payment success" })
            }
        })
        app.post("/create-payment-intent", verifyJWT, async (req, res) => {
            const bookingData = req.body;
            const price = bookingData.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                "payment_method_types": [
                    "card"
                ]
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/addreportproduct', verifyJWT, verifyBuyer, async (req, res) => {
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


        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            console.log(email)
            const user = await userCollection.findOne({ email: email })
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' })
                res.send({ token })
            }
            else {
                res.status(403).send({ token: '' })
            }
        })

        app.get('/allreportitem', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const result = await (await reportProductsCollection.find({}).toArray()).reverse();
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
        app.get('/userwishlist', verifyJWT, verifyBuyer, async (req, res) => {
            try {
                const email = req.query.email;
                const filter = { wishlistUser: email }
                const result = await (await wishListCollection.find(filter).toArray()).reverse();
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.get('/userproduct', verifyJWT, verifySeller, async (req, res) => {
            try {
                const email = req.query.email;
                const filter = { selleremail: email }
                const result = await (await productsCollection.find(filter).toArray()).reverse();
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

        app.get('/allbuyer', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const query = { role: 'buyer' }
                const result = await userCollection.find(query).toArray();
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.get('/allseller', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const query = { role: 'seller' }
                const result = await userCollection.find(query).toArray();
                res.send(result)

            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.get('/alluser', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const query = {}
                const result = await userCollection.find(query).toArray();
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.get('/adverticeproduct', verifyJWT, async (req, res) => {
            try {
                const query = { advertice: 'true', status: 'true' }
                const result = await productsCollection.find(query).limit(5).toArray();
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.get('/payment/:id', verifyJWT, verifyBuyer, async (req, res) => {
            try {
                const id = req.params.id;

                const query = { _id: ObjectId(id) }
                const result = await bookingCollection.findOne(query);
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.get('/mybooking', verifyJWT, verifyBuyer, async (req, res) => {
            try {
                const email = req.query.email;
                const query = { useremail: email }
                const result = await (await bookingCollection.find(query).toArray()).reverse();
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot insert user" })
            }
        })
        app.put('/verifyuser', verifyJWT, verifyAdmin, async (req, res) => {
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
        app.put('/makeadmin', verifyJWT, verifyAdmin, async (req, res) => {
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
                res.send({ status: false, message: "cannot make admin" })
            }
        })
        app.put('/updateproduct', verifySeller, async (req, res) => {
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

        app.delete('/deletereport', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const productId = req.query.productId
                productId
                const query = { _id: ObjectId(productId) }
                const productDelete = await productsCollection.deleteOne(query);
                const deleted = { productId: productId }
                const deletedById = await bookingCollection.deleteMany(deleted)
                const deletedByIds = await wishListCollection.deleteMany(deleted)
                console.log(productId)
                const id = req.query.id;
                const filter = { _id: ObjectId(id) }
                const result = await reportProductsCollection.deleteOne(filter);
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot delete report" })
            }
        })

        app.delete('/deleteproduct', verifyJWT, verifySeller, async (req, res) => {
            try {
                const id = req.query.id;
                const deleted = { productId: id }
                const deletedById = await bookingCollection.deleteMany(deleted)
                const deletedByIdw = await wishListCollection.deleteMany(deleted)
                const deletedByIdA = await reportProductsCollection.deleteMany(deleted)
                const filter = { _id: ObjectId(id) }
                const result = await productsCollection.deleteOne(filter);
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot delete product" })
            }
        })

        app.delete('/deletebooking', verifyJWT, verifyBuyer, async (req, res) => {
            try {
                const id = req.query.id;
                const filter = { _id: ObjectId(id) }
                const result = await bookingCollection.deleteOne(filter);
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot delete booking" })
            }
        })
        app.delete('/deleteuser', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const id = req.query.id;
                const filter = { _id: ObjectId(id) }
                const result = await userCollection.deleteOne(filter);
                res.send(result)
            }
            catch {
                res.send({ status: false, message: "cannot delete user" })
            }
        })
        app.delete('/paymentproductdelete', async (req, res) => {
            try {
                const productId = req.query.productId;
                const bookingId = req.query.bookingId;

                const deleteProduct = await productsCollection.deleteOne({ _id: ObjectId(productId) })
                const deleteBooking = await bookingCollection.deleteOne({ _id: ObjectId(bookingId) })
            }
            catch {
                res.send({ status: false, message: "cannot delete product user" })
            }


        })





    }
    catch (error) {
        console.log(error)
    }
}
run().catch(e => console.log(e))


app.listen(port, () => {
    console.log('Server is Running', port)
})