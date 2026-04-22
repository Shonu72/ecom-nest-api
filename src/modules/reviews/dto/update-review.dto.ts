import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateReviewDto {
    @ApiProperty({ example: 4, minimum: 1, maximum: 5, required: false })
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    rating?: number;

    @ApiProperty({ example: 'Updated comment', required: false })
    @IsString()
    @IsOptional()
    comment?: string;
}
