import { IsOptional, IsString, Length } from "class-validator";

export class ChangeProfileDto {
    @IsOptional({message: 'Incorrect login'})
    @IsString({message: 'The login must be a string.'})
    @Length(5, 30, {message: 'The login can contain 5 characters minimum and 30 characters maximum'})
    readonly login?: string;
    
    @IsOptional({message: 'Incorrect avatar'})
    readonly avatar?: string;

    @IsOptional({message: 'Incorrect password'})
    @IsString({message: 'The password must be a string.'})
    @Length(5, 30, {message: 'The password can contain 5 characters minimum and 30 characters maximum'})
    readonly password?: string;
}