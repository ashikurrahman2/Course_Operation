const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;
app.use(cors());
app.use(express.json());

async function run() {
  const client = new MongoClient(DB_CONNECTION_STRING);
  try {
    await client.connect();
    const db = client.db("products"); // Use the correct database name 'products'
    const productColl = db.collection("items"); // Use the 'items' collection inside the 'products' database

    const coursesDb = client.db("courses");
    const courseColl = coursesDb.collection("coursedata"); // Use 'coursedata' collection here

    const userdb = client.db("user");  // Correctly pointing to the 'user' database
const usersColl = userdb.collection("users");  // Using the 'users' collection in the 'user' database
    
    app.get("/", (req, res) => {
      res.send("Welcome to the Product API");
    });
    // Products Endpoints
    app.get("/products", async (req, res) => {
      try {
        const result = await productColl.find({}).toArray();
        res.status(200).json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    app.get("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await productColl.findOne({ _id: ObjectId(id) });
        if (!result) {
          res.status(404).json({ error: "Product not found" });
        } else {
          res.status(200).json(result);
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    app.post("/products", async (req, res) => {
      try {
        const newProduct = req.body;
        const result = await productColl.insertOne(newProduct);
        res.status(201).json(result); // Updated for the latest driver
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    app.delete("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await productColl.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          res.status(404).json({ error: "Product not found" });
        } else {
          res.status(200).json({ message: "Product deleted" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    app.put('/products/:id', async (req, res) => {
      try {
        const productId = req.params.id;
        const updatedProductData = req.body;

        const result = await productColl.findOneAndUpdate(
          { _id: new ObjectId(productId) },
          { $set: updatedProductData },
          { returnDocument: 'after' } // Updated for the latest driver
        );

        if (!result.value) {
          return res.status(404).send('Product not found');
        }

        res.status(200).json(result.value); // Send the updated product data
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
      }
    });

    // Courses Collections
    app.post('/courses', async (req, res) => {
      console.log('Received request to add course:', req.body); 
      try {
        const newCourse = req.body; 
        const result = await courseColl.insertOne(newCourse); 
        res.status(201).json(result); // Updated for the latest driver
      } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
      }
    });

    app.get('/courses', async (req, res) => {
      try {
        const courses = await courseColl.find().toArray(); 
        res.json(courses);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/courses/:id', async (req, res) => {
      try {
        const course = await courseColl.findOne({ _id: ObjectId(req.params.id) }); 
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/courses/:id', async (req, res) => {
      try {
        const course = await courseColl.findOneAndUpdate(
          { _id: new ObjectId(req.params.id) }, 
          { $set: req.body },
          { returnDocument: 'after' } // Updated for the latest driver
        );
        if (!course.value) return res.status(404).json({ error: 'Course not found' });
        res.json(course.value); 
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.delete('/courses/:id', async (req, res) => {
      try {
        const result = await courseColl.deleteOne({ _id: new ObjectId(req.params.id) }); 
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Course not found' });
        res.json({ message: 'Course deleted successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Users Endpoints
    app.get("/users", async (req, res) => {
      try {
        const result = await usersColl.find({}).toArray();
        res.status(200).json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.get("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await usersColl.findOne({ _id: ObjectId(id) });
        if (!result) {
          res.status(404).json({ error: "User not found" });
        } else {
          res.status(200).json(result);
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.post("/users/register", async (req, res) => {
      try {
        const newUser = req.body;
        newUser.role = "user";
        const result = await usersColl.insertOne(newUser);  // Ensure it's using 'usersColl'
        res.status(201).json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.delete("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await usersColl.deleteOne({ _id: ObjectId(id) });
        if (result.deletedCount === 0) {
          res.status(404).json({ error: "User not found" });
        } else {
          res.status(200).json({ message: "User deleted" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.put("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedUser = req.body;
        const result = await usersColl.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedUser }
        );
        if (result.matchedCount === 0) {
          res.status(404).json({ error: "User not found" });
        } else {
          res.status(200).json(result);
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    console.log("🌎 Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the application in case of error
  }
}

run().catch(console.error);
