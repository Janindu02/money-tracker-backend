import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ConvertCurrencyDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  from!: string;

  @ApiProperty({ example: 'LKR' })
  @IsString()
  to!: string;
}

export class RatesQueryDto {
  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  base?: string;
}
