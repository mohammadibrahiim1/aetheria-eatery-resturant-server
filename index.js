const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("./routes/stripe");
// const Stripe = require("stripe");
// const stripe = Stripe(
//   "sk_test_51MlpzGLrYWLOOZ8Ueo9lSKyjvBkUNZAQCqRDvVO5x1wiwu0MbJ2V6DeVFW7YHcoeCi0axInmbfmxCfIE5MrvaswE003sZXKmdG"
// );

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/stripe", stripe);

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
  const menuCollection = client.db("aetheria").collection("menu");
  // const paymentCollection = client.db("aetheria").collection("payments");
  const checkoutCollection = client.db("aetheria").collection("checkout");
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // post user data to database
    app.post("/users", async (req, res) => {
      const users = req.body;
      console.log(users);
      const result = await usersCollection.insertOne(users);
      res.send(result);
    });

    // get all food  from collection
    app.get("/allProducts", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // get menu data
    app.get("/menu", async (req, res) => {
      const query = {};
      const cursor = menuCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // add checkout form data
    // app.post("/checkoutInfo", async (req, res) => {
    //   const checkout = req.body;
    //   const result = await checkoutCollection.insertOne(checkout);
    //   res.send(result);
    // });

    app.get("/checkoutInfo", async (req, res) => {
      const query = {};
      const cursor = checkoutCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get data by category and filter data by category
    app.get("/category", async (req, res) => {
      if (req.query.category) {
        const query = { category: req.query.category };
        const result = await menuCollection.find(query).toArray();

        res.send(result);
      } else {
        const query = {};
        const result = await menuCollection.find(query).toArray();
        res.send(result);
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("simple node server running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
