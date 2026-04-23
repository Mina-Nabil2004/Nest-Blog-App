import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(1, { message: 'Tag name is required' })
    name!: string;
}
