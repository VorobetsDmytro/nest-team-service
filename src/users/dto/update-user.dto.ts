import { IsEmail, IsOptional, IsString, Length, Matches } from "class-validator";

export class UpdateUserDto {
    @IsOptional({message: 'Bad email'})
    @IsString({message: 'The email must be a string'})
    @IsEmail({}, {message: 'Incorrect email'})
    readonly email?: string;

    @IsOptional({message: 'Bad login'})
    @IsString({message: 'The login must be a string'})
    @Length(5, 30, {message: 'The login can contain 5 characters minimum and 30 characters maximum'})
    readonly login?: string;

    @IsOptional({message: 'Bad firstName'})
    @IsString({message: 'The firstName must be a string.'})
    @Length(2, 25, {message: 'The firstName can contain 5 characters minimum and 30 characters maximum'})
    @Matches(/^[A-Z]+[a-zA-z]+$/, {message: 'Incorrect firstname'})
    readonly firstName?: string;

    @IsOptional({message: 'Bad lastName'})
    @IsString({message: 'The lastName must be a string.'})
    @Length(2, 25, {message: 'The lastName can contain 5 characters minimum and 30 characters maximum'})
    @Matches(/^[A-Z]+[a-zA-z]+$/, {message: 'Incorrect lastName'})
    readonly lastName?: string;
}