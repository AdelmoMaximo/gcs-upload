// src/file-upload/file-upload.service.ts

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { UploadPayloadDto } from './dto/upload-payload.dto';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly storage: Storage;
  private readonly bucketName = 'pass-queue';
  private readonly folders = ['pending', 'processed', 'finished', 'error'];

  constructor() {
    this.storage = new Storage();
  }

  /**
   * Receives a validated DTO and saves its 'body' property to a GCS file.
   */
  async saveJsonToBucket(
    payload: UploadPayloadDto,
  ): Promise<{ message: string; fileName: string }> {
    // A validação do payload já foi feita pelo DTO e ValidationPipe.
    const bucket = this.storage.bucket(this.bucketName);
    const folderName = 'pending';
    const uuid = uuidv4();

    // Usa a propriedade 'redirect' (em minúsculas) para o nome do arquivo.
    const sanitizedRedirect = payload.redirect.toLowerCase();
    const fileName = `${sanitizedRedirect}_${uuid}.json`;
    const fullPath = `${folderName}/${fileName}`;
    const file = bucket.file(fullPath);

    // Salva APENAS o conteúdo da propriedade 'body' no arquivo.
    const fileContents = JSON.stringify(payload.body, null, 2);

    try {
      this.logger.log(`Uploading file to gs://${this.bucketName}/${fullPath}`);
      await file.save(fileContents, { contentType: 'application/json' });
      this.logger.log(`File saved successfully: ${fullPath}`);

      return {
        message: 'JSON file successfully saved to the pending folder.',
        fileName: fileName,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to GCS', error.stack);
      throw new InternalServerErrorException(
        'An error occurred while trying to save the file to the bucket.',
      );
    }
  }

  /**
   * O método de verificação de status permanece o mesmo.
   */
  async checkFileStatus(
    fileName: string,
  ): Promise<{ status: string; data?: any }> {
    const bucket = this.storage.bucket(this.bucketName);

    for (const folder of this.folders) {
      const fullPath = `${folder}/${fileName}`;
      const file = bucket.file(fullPath);
      const [exists] = await file.exists();

      if (exists) {
        this.logger.log(`File ${fileName} found in folder: ${folder}`);
        if (folder === 'finished') {
          const [content] = await file.download();
          return {
            status: 'finished',
            data: JSON.parse(content.toString('utf8')),
          };
        }
        return { status: folder };
      }
    }

    this.logger.warn(`File ${fileName} not found in any monitored folder.`);
    throw new NotFoundException(`File with name ${fileName} not found.`);
  }
}
