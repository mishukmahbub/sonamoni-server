const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


//TODO
const uri = `mongodb+srv://mishukmahbub:TLUhfdQ5ffVXZNcs@cluster0.s07xdem.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const ToyCarsCollection = client.db('ToyCarsDB').collection('ToyCarsCollection');

        //CRUD functions go here

        //READ all
        app.get('/allToys', async (req, res) => {
            const cursor = ToyCarsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Read one
        app.get("/singleToy/:id", async (req, res) => {
            console.log(req.params.id);
            const toy = await ToyCarsCollection.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.send(toy);
        });

        //Read by search
        app.get("/getToysByText/:text", async (req, res) => {
            const text = req.params.text;
            console.log(text);
            const result = await ToyCarsCollection
                .find({
                    $or: [
                        { name: { $regex: text, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });

        //Read by sub-category
        app.get('/getToysBySubCategory/:text', async (req, res) => {
            console.log("text", req.params.text);
            const text = req.params.text;
            const result = await ToyCarsCollection
                .find({ sub_category: text })
                .toArray();
            console.log("sub category", result);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Toy server is running')
})

app.listen(port, () => {
    console.log(`Toy Server is running on port: ${port}`)
})