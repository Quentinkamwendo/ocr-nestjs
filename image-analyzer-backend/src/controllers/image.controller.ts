import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  Delete,
  Req,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { ImageProcessingService } from '../services/image-processing.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as PDFDocument from 'pdfkit';
import * as docx from 'docx';
import { Readable } from 'stream';

@Controller('api/images')
export class ImageController {
  constructor(
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('keywords') keywords: string,
    @Req() req: Request,
  ) {
    // Parse keywords from JSON string back to array
    const keywordsArray = keywords ? JSON.parse(keywords) : [];
    return this.imageProcessingService.processImage(file, keywordsArray, req);
  }

  @Get(':id/export/pdf')
  async exportToPdf(@Param('id') id: number, @Res() res: Response) {
    try {
      const image = await this.imageProcessingService.getImageById(id);
      if (!image) {
        return res.status(404).send('Image not found');
      }

      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=analysis-${id}.pdf`,
      );

      doc.pipe(res);
      doc
        .fontSize(16)
        .text('Image Analysis Report', { align: 'center' })
        .moveDown();
      doc.fontSize(12).text(`File: ${image.originalName}`).moveDown();
      doc.text(`Status: ${image.status}`).moveDown();
      doc.text('Extracted Text:').moveDown();
      doc.text(image.extractedText).moveDown();
      doc.end();
    } catch (error) {
      console.log(error);
      res.status(500).send('Error generating PDF');
    }
  }

  @Get(':id/export/docx')
  async exportToWord(@Param('id') id: number, @Res() res: Response) {
    try {
      const image = await this.imageProcessingService.getImageById(id);
      if (!image) {
        return res.status(404).send('Image not found');
      }

      const doc = new docx.Document({
        sections: [
          {
            properties: {},
            children: [
              new docx.Paragraph({
                text: 'Image Analysis Report',
                heading: docx.HeadingLevel.HEADING_1,
                alignment: docx.AlignmentType.CENTER,
              }),
              new docx.Paragraph({
                text: `File: ${image.originalName}`,
              }),
              new docx.Paragraph({
                text: `Status: ${image.status}`,
              }),
              new docx.Paragraph({
                text: 'Extracted Text:',
                heading: docx.HeadingLevel.HEADING_2,
              }),
              new docx.Paragraph({
                text: image.extractedText,
              }),
            ],
          },
        ],
      });

      const buffer = await docx.Packer.toBuffer(doc);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=analysis-${id}.docx`,
      );

      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);
      stream.pipe(res);
    } catch (error) {
      console.log(error);
      res.status(500).send('Error generating Word document');
    }
  }

  @Get()
  async getAllImages() {
    return this.imageProcessingService.getAllImages();
  }

  @Get(':id')
  async getImageById(@Param('id') id: number) {
    return this.imageProcessingService.getImageById(id);
  }

  @Get('status/:status')
  async getImagesByStatus(@Param('status') status: 'accepted' | 'rejected') {
    return this.imageProcessingService.getImagesByStatus(status);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async updateImage(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('keywords') keywords: string,
    @Req() req: Request,
  ) {
    const keywordsArray = keywords ? JSON.parse(keywords) : [];
    return this.imageProcessingService.updateImage(
      id,
      file,
      keywordsArray,
      req,
    );
  }

  @Delete(':id')
  async deleteImage(@Param('id') id: number) {
    await this.imageProcessingService.deleteImage(id);
    return { message: 'Image deleted successfully' };
  }
}
