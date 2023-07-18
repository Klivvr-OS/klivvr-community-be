import { postService } from '../modules';
import express from 'express';
import { multerUpload } from '../utils/multer';
import { cloudinaryInstance } from '../services/Cloudinary';

const router = express.Router();

router.post('/', multerUpload.single('image'), async (req, res) => {
  const localFilePath = req.file?.path || '';
  const userId = Number(req.body.userId);
  const { isSuccess, message, statusCode, imageURL } =
    await cloudinaryInstance.uploadImage(localFilePath);
  const { description } = req.body;
  const newpostObject = await postService.createOne({
    description,
    photoURL: imageURL,
    userId,
  });
  res.status(201).json(newpostObject);
});

router.get('/', async (req, res) => {
  const postObjects = await postService.findMany();
  res.status(200).json(postObjects);
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const postObject = await postService.findOne({ id });
    res.status(200).json(postObject);
  } catch (error: any) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { description, photoURL } = req.body;
    const updatedpostObject = await postService.updateOne(
      { id },
      { description, photoURL },
    );
    res.status(200).json(updatedpostObject);
  } catch (error: any) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const deletedpostObject = await postService.deleteOne({ id });
    res.status(200).json(deletedpostObject);
  } catch (error: any) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});

export default router;
