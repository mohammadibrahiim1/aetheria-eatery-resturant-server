const express = require("express");
const app = express();
const cors = require("cors");
// const stripe = require("./routes/stripe");



const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// app.use("/stripe", stripe);

require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// const uri = 'mongodb://127.0.0.1:27017';
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wuwpwwx.mongodb.net/?retryWrites=true&w=majority`;
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
  const bookingOptionsCollection = client
    .db("aetheria")
    .collection("bookingOptions");
  const checkoutCollection = client.db("aetheria").collection("checkout");
  const checkoutPostDataCollection = client
    .db("aetheria")
    .collection("checkoutInfo");
  const bookingsCollection = client.db("aetheria").collection("bookings");
  const ourTeamCollection = client.db("aetheria").collection("team");

  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    //  get bookingslots

    app.get("/bookingOptions", async (req, res) => {
      const date = req.query.date;
      // console.log(date);
      const query = {};
      const options = await bookingOptionsCollection.find(query).toArray();
      const bookingQuery = { bookingDate: date };
      const alreadyBooked = await bookingsCollection
        .find(bookingQuery)
        .toArray();

      options.forEach((option) => {
        const optionBooked = alreadyBooked.filter(
          (book) => book.table === option.name
        );
        const bookedSlots = optionBooked.map((book) => book.slot);

        // remove the slots for every table
        const remainingSlots = option.slots.filter(
          (slot) => !bookedSlots.includes(slot)
        );

        option.slots = remainingSlots;
        // console.log(option.name, remainingSlots.length);
      });

      res.send(options);
    });

    // app.get("/v2/bookingOptions", async (req, res) => {
    //   const date = req.query.date;
    //   console.log(date);
    //   const options = await bookingOptionsCollection
    //     .aggregate([
    //       {
    //         $lookup: {
    //           from: "bookings",
    //           localField: "name",
    //           foreignField: "tableCategory",
    //           pipeline: [
    //             {
    //               $match: {
    //                 $expr: {
    //                   $eq: ["$bookingDate", date],
    //                 },
    //               },
    //             },
    //           ],
    //           as: "booked",
    //         },
    //       },
    //       {
    //         $project: {
    //           name: 1,
    //           price: 1,
    //           slots: 1,
    //           booked: {
    //             $map: {
    //               input: "$booked",
    //               as: "book",
    //               in: "$$book.slot",
    //             },
    //           },
    //         },
    //       },
    //       {
    //         $project: {
    //           name: 1,
    //           price: 1,
    //           slots: {
    //             $setDifference: ["$slots", "$booked"],
    //           },
    //         },
    //       },
    //     ])
    //     .toArray();
    //   res.send(options);
    // });

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

  

    app.post("/checkoutPostInfo", async (req, res) => {
      const checkoutData = req.body;
      console.log(checkoutData);
      const result = await checkoutPostDataCollection.insertOne(checkoutData);
      res.send(result);
    });

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

    // get ourTeam data
    app.get("/team", async (req, res) => {
      const query = {};
      const ourTeam = await ourTeamCollection.find(query).toArray();
      res.send(ourTeam);
    });

    // booking data
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const query = {
        bookingDate: booking.bookingDate,
        email: booking.email,
        table: booking.table,
      };
      const alreadyBooked = await bookingsCollection.find(query).toArray();
      if (alreadyBooked.length) {
        const message = `you already have a  booking on ${booking.bookingDate}  `;
        return res.send({
          acknowledged: false,
          message,
        });
      }
      const result = await bookingsCollection.insertOne(booking);
      // sendEmail(booking);
      res.send(result);
      console.log(result);
    });

    // get all bookings data
    app.get("/bookings", async (req, res) => {
      const query = {};
      const booking = await bookingsCollection.find(query).toArray();
      res.send(booking);
    });

    // get all users
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    // get admin user  by email
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // make an user admin
    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
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
