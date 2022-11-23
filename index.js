const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send({ status: true, Message: 'Sell Buy Laptop Server Is Running' })
})



app.listen(port, () => {
    console.log('Server is Running', port)
})