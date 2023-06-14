const express = require("express");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion } = require("mongodb");
// const uri = 'mongodb://127.0.0.1:27017';
const uri =
  "mongodb+srv://aetheria:7dbNVKMI0Y6RLjBH@cluster0.wuwpwwx.mongodb.net/?retryWrites=true&w=majority";
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const usersCollection = client.db("aetheria").collection("users");
  const productCollection = client.db("aetheria").collection("foods");
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.post("/users", async (req, res) => {
      const users = req.body;
      console.log(users);
      const result = await usersCollection.insertOne(users);
      res.send(result);
    });

    app.get("/allProducts", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/category", async (req, res) => {
      // const category = req.params.category;
      // const query = { category: category };
      // const result = await productCollection.find(query);
      // res.send(result);
      if (req.query.category) {
        const query = { category: req.query.category };
        const result = await productCollection.find(query).toArray();
        console.log(result);
        res.send(result);
      } else {
        const query = {};
        const result = await productCollection.find(query).toArray();
        res.send(result);
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// aetheria
// nurRM6JjO3PLLDOV

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("simple node server running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
