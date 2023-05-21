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
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s07xdem.mongodb.net/?retryWrites=true&w=majority`;
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
            const result = (await cursor.limit(20).toArray());
            res.send(result);
        })

        // Read one
        app.get("/singleToy/:id", async (req, res) => {
            // console.log(req.params.id);
            const toy = await ToyCarsCollection.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.send(toy);
        });

        //Read by search
        app.get("/getToysByText/:text", async (req, res) => {
            const text = req.params.text;
            
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
            
            const text = req.params.text;
            const result = await ToyCarsCollection
                .find({ sub_category: text })
                .toArray();
            
            res.send(result);
        });

        // Read by email
        app.get("/myToys/:email", async (req, res) => {
            // console.log(req.params.email);
            const result = await ToyCarsCollection
              .find({
                seller_email: req.params.email,
              })
              .toArray();
            res.send(result);
          });

          // update toy info
          app.put("/editToy/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            // console.log(parseInt(req.body.price));
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
              $set: {
                price: parseInt(req.body.price),
                available_quantity: parseInt(req.body.available_quantity),
                detail_description: req.body.detail_description,
              },
            };
            const result = await ToyCarsCollection.updateOne(filter, updateDoc);
            res.send(result);
          });

          // delete toy
          app.delete('/deleteToy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ToyCarsCollection.deleteOne(query);
            res.send(result);
        })

        // Add toy
        app.post("/addToys", async (req, res) => {
            const body = req.body;
            body.createdAt = new Date();
            console.log(body);
            const result = await ToyCarsCollection.insertOne(body);
            if (result?.insertedId) {
              return res.status(200).send(result);
            } else {
              return res.status(404).send({
                message: "can not insert try again later",
                status: false,
              });
            }
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