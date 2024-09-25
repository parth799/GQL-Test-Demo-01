import multer from 'multer';
import { Request } from 'express';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: (Error | null), destination: string) => void) {
        cb(null, path.join(__dirname, './public/temp')); 
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: (Error | null), filename: string) => void) {
        cb(null, Date.now() + '-' + file.originalname); 
    }
});

export const upload = multer({ storage });
