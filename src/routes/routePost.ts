import { postService } from '../modules';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  const { description, photoURL, userId } = req.body;
  const newpostObject = await postService.createOne(
    description,
    photoURL,
    userId,
  );
  res.status(201).json(newpostObject);
});

router.get('/', async (req, res) => {
  const postObjects = await postService.findMany();
  res.status(200).json(postObjects);
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const postObject = await postService.findOne(Number(id));
    res.status(200).json(postObject);
  } catch (error: any) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});

export default router;
