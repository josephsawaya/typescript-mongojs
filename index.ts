import { MongoClient } from "mongodb";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
const uri = process.env.URI;
let mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

interface Project {
  name: string;
  users: string[];
  description: string;
  tags: string[];
}

const app = express();
app.use(async (req, res, next) => {
  if (!mongoClient.isConnected()) {
    try {
      mongoClient = await mongoClient.connect();
      console.log("connected");
      next();
    } catch (e) {
      res.status(500).send(e);
    }
  } else {
    next();
  }
});

app.use(bodyParser.json());

app.get("/projects", async (req, res) => {
  res.json(
    await mongoClient
      .db("main")
      .collection<Project>("projects")
      .find()
      .toArray()
  );
});

app.post(
  "/projects",
  async (
    req: Request<{}, {}, Project, {}>,
    res: Response<Project | string>
  ) => {
    if (!req.body) res.status(400).send("Bad Request body");
    else if (
      !req.body.description ||
      !req.body.name ||
      !req.body.tags ||
      !req.body.users
    ) {
      res.status(400).send("Bad Request");
    } else {
      const newProject = req.body;
      await mongoClient
        .db("main")
        .collection<Project>("projects")
        .insertOne(newProject);
      res.json(newProject);
    }
  }
);

app.listen(8080, async () => {
  console.log("Listening on PORT 8080");
});
