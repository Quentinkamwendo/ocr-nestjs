import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createWorker, Worker } from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';
import { Image } from '../entities/image.entity';
import { Request } from 'express';

@Injectable()
export class ImageProcessingService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  private readonly acceptedFolder = 'uploads/accepted';
  private readonly rejectedFolder = 'uploads/rejected';

  async processImage(
    file: Express.Multer.File,
    keywords: string[],
    req: Request,
  ): Promise<{ status: string; data: any }> {
    let worker: Worker;
    try {
      // Create folders if they don't exist
      [this.acceptedFolder, this.rejectedFolder].forEach((folder) => {
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true });
        }
      });

      // Extract text from image using Tesseract
      worker = await createWorker('eng');
      //   await worker.loadLanguage('eng');
      //   await worker.initialize('eng');
      const {
        data: { text },
      } = await worker.recognize(file.path);
      // await worker.terminate();

      // Check if any keywords match the extracted text
      const matches = keywords.some((keyword) =>
        text.toLowerCase().includes(keyword.toLowerCase()),
      );

      const keywordsString = keywords.join(', ');

      // Construct the file path with host and port
      const host = req.hostname;
      const protocol = req.protocol;
      const port = process.env.PORT || 3000;
      const filePath = `${protocol}://${host}:${port}/uploads/${matches ? 'accepted' : 'rejected'}/${file.filename}`;

      // Determine target folder and move file
      const targetFolder = matches ? this.acceptedFolder : this.rejectedFolder;
      const targetPath = path.join(targetFolder, file.filename);
      fs.renameSync(file.path, targetPath);

      // Save to database
      const image = this.imageRepository.create({
        filename: file.filename,
        originalName: file.originalname,
        // path: targetPath,
        keywords: keywordsString,
        path: filePath,
        extractedText: text,
        status: matches ? 'accepted' : 'rejected',
        createdAt: new Date(),
      });
      await this.imageRepository.save(image);

      return {
        status: matches ? 'accepted' : 'rejected',
        data: {
          image,
          extractedText: text,
        },
      };
    } catch (error) {
      throw new Error(`Failed to process image: ${error.message}`);
    } finally {
      // Always terminate Tesseract worker;
      if (worker) await worker.terminate();

      // Ensure the temporary file is removed if not already handled
      if (file && fs.existsSync(file.path)) {
        await fs.promises.unlink(file.path).catch(() => null);
      }
    }
  }

  async getAllImages(): Promise<Image[]> {
    return this.imageRepository.find();
  }

  async getImagesByStatus(status: 'accepted' | 'rejected'): Promise<Image[]> {
    return this.imageRepository.find({ where: { status } });
  }

  async getImageById(id: number): Promise<Image | null> {
    return this.imageRepository.findOne({ where: { id } });
  }

  async updateImage(
    id: number,
    file: Express.Multer.File,
    keywords: string[],
    req: Request,
  ): Promise<Image> {
    let worker: Worker;
    const image = await this.getImageById(id);
    if (image) {
      worker = await createWorker('eng');
      //   await worker.loadLanguage('eng');
      //   await worker.initialize('eng');
      const {
        data: { text },
      } = await worker.recognize(file.path);
      // await worker.terminate();

      // Check if any keywords match the extracted text
      const matches = keywords.some((keyword) =>
        text.toLowerCase().includes(keyword.toLowerCase()),
      );

      const keywordsString = keywords.join(', ');

      // Construct the file path with host and port
      const host = req.hostname;
      const protocol = req.protocol;
      const port = process.env.PORT || 3000;
      const filePath = `${protocol}://${host}:${port}/uploads/${matches ? 'accepted' : 'rejected'}/${file.filename}`;

      // Determine target folder and move file
      const targetFolder = matches ? this.acceptedFolder : this.rejectedFolder;
      const targetPath = path.join(targetFolder, file.filename);
      fs.renameSync(file.path, targetPath);

      if (image.path) {
        // Delete the old image file from the filesystem
        const oldImagePath = path.join(
          image.status === 'accepted'
            ? this.acceptedFolder
            : this.rejectedFolder,
          image.filename,
        );
        await fs.promises.unlink(oldImagePath);

        // Update the image with the new file and keywords
        image.filename = file.filename;
        image.originalName = file.originalname;
        image.keywords = keywordsString;
        image.path = filePath;
        image.extractedText = text;
        image.status = matches ? 'accepted' : 'rejected';
        return this.imageRepository.save(image);
      }

      // Determine the path based on the status
      // const imagePath =
      //   image.status === 'accepted'
      //     ? path.join(this.acceptedFolder, file.filename)
      //     : path.join(this.rejectedFolder, file.filename);

      // Delete the image file from the filesystem
      // await fs.promises.unlink(imagePath);

      // Update the image with the new file and keywords
      // image.filename = file.filename;
      // image.originalName = file.originalname;
      // image.keywords = keywordsString;
      // return this.imageRepository.save(image);
    }
    return null;
  }

  async deleteImage(id: number): Promise<void> {
    const image = await this.getImageById(id);
    if (image) {
      // Determine the path based on the status
      const imagePath =
        image.status === 'accepted'
          ? path.join(this.acceptedFolder, image.filename)
          : path.join(this.rejectedFolder, image.filename);

      // Delete the image file from the filesystem and remove it from the database
      await fs.promises.unlink(imagePath);
      await this.imageRepository.delete(id);
    }
  }
}
