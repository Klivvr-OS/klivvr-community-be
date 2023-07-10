import express from "express";
import { helloService } from "../modules";

const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;
  const newhelloObject = await helloService.createOne(message);
  res.status(201).json(newhelloObject);
});

router.get("/", async (req, res) => {
  const helloObjects = await helloService.findMany();
  res.status(200).json(helloObjects);
});

export default router;
