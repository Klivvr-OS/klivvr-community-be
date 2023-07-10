import express from 'express';
import { helloService } from '../modules';

const router = express.Router();

router.post('/', async (req, res) => {
    try{
        const { message } = req.body;
        const newhelloObject = await helloService.createOne(message);
        res.status(201).json(newhelloObject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating hello object' });
    }
});

router.get('/', async (req, res) => {
    try{
        const helloObjects = await helloService.findMany();
        res.status(200).json(helloObjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting all hello objects' });
    }
});

export default router;