import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { UploadPayloadDto } from './dto/upload-payload.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly storage: Storage;
  private readonly bucketName = 'pass-queue';
  private readonly folderName = 'pending';

  constructor() {
    // O cliente Storage irá usar automaticamente as credenciais do ambiente
    // (GOOGLE_APPLICATION_CREDENTIALS) se estiver rodando localmente,
    // ou as credenciais da service account se estiver no GCP (ex: Cloud Run, GKE).
    this.storage = new Storage();
  }

  async saveJsonToBucket(
    payload: UploadPayloadDto,
  ): Promise<{ message: string; filePath: string }> {
    const bucket = this.storage.bucket(this.bucketName);

    // Gera um nome de arquivo único para evitar colisões
    const fileName = `${this.folderName}/${uuidv4()}.json`;
    const file = bucket.file(fileName);

    // Converte o corpo do JSON para uma string formatada
    const fileContents = JSON.stringify(payload, null, 2);

    try {
      this.logger.log(
        `Iniciando upload para gs://${this.bucketName}/${fileName}`,
      );

      await file.save(fileContents, {
        contentType: 'application/json',
      });

      this.logger.log(`Arquivo salvo com sucesso em: ${fileName}`);

      return {
        message: 'Arquivo JSON salvo com sucesso na pasta pending.',
        filePath: `gs://${this.bucketName}/${fileName}`,
      };
    } catch (error) {
      this.logger.error(
        'Falha ao fazer upload do arquivo para o GCS',
        error.stack,
      );
      throw new InternalServerErrorException(
        'Ocorreu um erro ao tentar salvar o arquivo no bucket.',
      );
    }
  }
}
