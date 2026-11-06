import { IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";

export  class CreateTenantDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
      name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    @Matches(/^[a-z0-9-]+$/, {
        message: 'Slug can only contain lowercase alphanumeric characters and dashes',
    })
    slug: string;

}