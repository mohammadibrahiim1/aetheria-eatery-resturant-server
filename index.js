const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51MlpzGLrYWLOOZ8Ueo9lSKyjvBkUNZAQCqRDvVO5x1wiwu0MbJ2V6DeVFW7YHcoeCi0axInmbfmxCfIE5MrvaswE003sZXKmdG"
);
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion } = require("mongodb");
const { default: Stripe } = require("stripe");
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
  const paymentCollection = client.db("aetheria").collection("payments");
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
    app.post("/checkoutInfo", async (req, res) => {
      const checkout = req.body;
      const result = await checkoutCollection.insertOne(checkout); 
      res.send(result);
    });

    // get data by category and filter data by category
    app.get("/category", async (req, res) => {
      if (req.query.category) {
        const query = { category: req.query.category };
        const result = await menuCollection.find(query).toArray();
        console.log(result);
        res.send(result);
      } else {
        const query = {};
        const result = await menuCollection.find(query).toArray();
        res.send(result);
      }

      // make payment with stripte
      // app.post("/create-payment-intent", async (req, res) => {
      //   const paymentData = req.body;
      //   const totalPrice = paymentData.totalPrice;
      //   const amount = totalPrice * 100;

      //   const paymentIntent = await stripe.paymentIntents.create({
      //     currency: "usd",
      //     amount: amount,
      //     payment_method_types: ["card"],
      //   });
      //   res.send({
      //     clientSecret: paymentIntent.client_secret,
      //   });
      // });

      // when user click on pay button then  store payments information in  collection in database
      // app.post("/payments", async (req, res) => {
      //   const payment = req.body;
      //   const result = await paymentCollection.insertOne(payment);
      //   const id = payment.bookingId;
      //   const filter = { _id: new ObjectId(id) };
      //   const updatedDocument = {
      //     $set: {
      //       paid: true,
      //       transactionId: payment.transactionId,
      //     },
      //   };
      //   const updatedResult = await bookingsCollection.updateOne(
      //     filter,
      //     updatedDocument
      //   );
      //   res.send();
      //   res.send(result);

      //   // ================
      // });

      // sk_test_51MlpzGLrYWLOOZ8Ueo9lSKyjvBkUNZAQCqRDvVO5x1wiwu0MbJ2V6DeVFW7YHcoeCi0axInmbfmxCfIE5MrvaswE003sZXKmdG

      //       const express = require("express");
      // const app = express();
      // // This is a public sample test API key.
      // // Don’t submit any personally identifiable information in requests made with this key.
      // // Sign in to see your own test API key embedded in code samples.
      // const stripe = require("stripe")('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

      // app.use(express.static("public"));
      // app.use(express.json());

      // const calculateOrderAmount = (items) => {
      //   // Replace this constant with a calculation of the order's amount
      //   // Calculate the order total on the server to prevent
      //   // people from directly manipulating the amount on the client
      //   return 1400;
      // };

      // app.post("/create-payment-intent", async (req, res) => {
      //   const { items } = req.body;

      //   // Create a PaymentIntent with the order amount and currency
      //   const paymentIntent = await stripe.paymentIntents.create({
      //     amount: calculateOrderAmount(items),
      //     currency: "usd",
      //     automatic_payment_methods: {
      //       enabled: true,
      //     },
      //   });

      //   res.send({
      //     clientSecret: paymentIntent.client_secret,
      //   });
      // });

      // app.listen(4242, () => console.log("Node server listening on port 4242!"));
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("simple node server running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
