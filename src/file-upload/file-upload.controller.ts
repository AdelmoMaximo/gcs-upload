// src/file-upload/file-upload.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { UploadPayloadDto } from './dto/upload-payload.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Upload de Arquivo')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Recebe um JSON estruturado e salva seu conteúdo em um bucket GCP',
    description:
      'O payload deve conter uma propriedade "redirect" (CORE, PAY ou BOOKING) e um objeto "body".',
  })
  @ApiBody({
    description: 'Um objeto JSON contendo as propriedades "redirect" e "body".',
    type: UploadPayloadDto,
  })
  @ApiResponse({
    status: 201,
    description: 'JSON file successfully saved.',
    schema: {
      example: {
        message: 'JSON file successfully saved to the pending folder.',
        fileName: 'core_a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6.json',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request (validation error, e.g., invalid "redirect" or missing "body").',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async saveJson(@Body() uploadPayloadDto: UploadPayloadDto) {
    return this.fileUploadService.saveJsonToBucket(uploadPayloadDto);
  }

  @Get('status/:fileName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verifica o status de um arquivo pelo nome completo',
  })
  @ApiParam({
    name: 'fileName',
    type: 'string',
    description: 'O nome completo do arquivo gerado durante o upload.',
    example: 'core_a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6.json',
  })
  @ApiResponse({ status: 200, description: 'File status found.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async getStatus(@Param('fileName') fileName: string) {
    return this.fileUploadService.checkFileStatus(fileName);
  }
}
