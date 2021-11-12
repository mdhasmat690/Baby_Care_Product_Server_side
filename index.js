const express = require("express");
const cors = require("cors");
const { MongoClient, Collection } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.az9qi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const dataBase = client.db("babyCareProduct");
    const productsCollection = dataBase.collection("products");
    const purchesDataCollection = dataBase.collection("purches");
    const reviewDataCollection = dataBase.collection("reviews");
    const usersCollection = dataBase.collection("users");
    //get api

    app.get("/products", async (req, res) => {
      const { limit } = req.query;
      let product = null;

      if (limit) {
        product = productsCollection.find({}).limit(parseInt(limit, 10));
      } else {
        product = productsCollection.find({});
      }

      const allproduct = await product.toArray();
      res.send(allproduct);
    });

    app.get("/review", async (req, res) => {
      const product = reviewDataCollection.find({});
      const allproduct = await product.toArray();
      res.send(allproduct);
    });

    app.get("/purches", async (req, res) => {
      const product = purchesDataCollection.find({});
      const allproduct = await product.toArray();
      res.send(allproduct);
    });

    //get single data by id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await productsCollection.findOne(query);
      res.send(service);
    });

    //get data by email id
    app.get("/purches/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const cursor = purchesDataCollection.find(query);
      const purche = await cursor.toArray();
      res.send(purche);
    });

    //post api
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.post("/purches", async (req, res) => {
      const product = req.body;
      const result = await purchesDataCollection.insertOne(product);
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const product = req.body;
      const result = await reviewDataCollection.insertOne(product);
      res.send(result);
    });
    //User
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.send(result);
    });

    app.patch("/purches/:id", async (req, res) => {
      const { id } = req.params;
      const result = await purchesDataCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: { status: "shipped" } }
      );
      console.log(result);
      res.send(result);
    });

    //delete post
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/purches/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await purchesDataCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    //     // await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Baby care product");
});

app.listen(port, () => {
  console.log("Baby care product server on  port ", port);
});
