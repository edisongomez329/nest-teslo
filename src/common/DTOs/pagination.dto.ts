import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive } from "class-validator";

export class PaginationDto {
    
    @ApiProperty({
        default: 10,
        example: 50,
        description: 'How many rows do you need'
    })
    @IsInt()
    @IsOptional()
    @IsPositive()
    @Type( () => Number)
    limit?: number;

    @ApiProperty({
        default: 0,
        example: 50,
        description: 'How many rows do you to skip'
    })
    @IsInt()
    @IsOptional()
    @IsPositive()    
    @Type( () => Number)
    offset?: number;
}