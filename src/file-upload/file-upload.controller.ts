import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { UploadPayloadDto } from './dto/upload-payload.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('File Upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('save-json')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Recebe um JSON e salva em um bucket no GCP' })
  @ApiBody({ type: UploadPayloadDto })
  @ApiResponse({
    status: 201,
    description: 'Arquivo JSON salvo com sucesso.',
    schema: {
      example: {
        message: 'Arquivo JSON salvo com sucesso na pasta pending.',
        filePath:
          'gs://pass-queue/pending/a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6.json',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida (Bad Request).',
  })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  async saveJson(@Body() uploadPayloadDto: UploadPayloadDto) {
    return this.fileUploadService.saveJsonToBucket(uploadPayloadDto);
  }
}
