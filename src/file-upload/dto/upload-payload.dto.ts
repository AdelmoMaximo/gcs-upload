import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';

// Enum para os valores permitidos de 'redirect'
export enum RedirectTarget {
  CORE = 'CORE',
  PAY = 'PAY',
  BOOKING = 'BOOKING',
}

export class UploadPayloadDto {
  @ApiProperty({
    description: 'O destino do redirecionamento.',
    enum: RedirectTarget,
    example: RedirectTarget.CORE,
  })
  @IsEnum(RedirectTarget, {
    message: `O campo redirect deve ser um dos seguintes valores: ${Object.values(
      RedirectTarget,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'O campo redirect não pode ser vazio.' })
  redirect: RedirectTarget;

  @ApiProperty({
    description: 'O corpo do JSON a ser salvo.',
    type: 'object',
    example: { orderId: 123, customer: 'John Doe' },
    additionalProperties: true,
  })
  @IsObject({ message: 'O campo body deve ser um objeto JSON.' })
  @IsNotEmpty({ message: 'O campo body não pode ser vazio.' })
  body: object;
}
