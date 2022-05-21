import { IsEmail, IsString, Length, Matches } from "class-validator";

export class CreateUserDto {
    readonly id?: string;

    @IsString({message: 'The email must be a string.'})
    @IsEmail({}, {message: 'Incorrect email'})
    readonly email: string;

    @IsString({message: 'The login must be a string.'})
    @Length(5, 30, {message: 'The login can contain 5 characters minimum and 30 characters maximum'})
    readonly login: string;

    @IsString({message: 'The password must be a string.'})
    @Length(5, 30, {message: 'The password can contain 5 characters minimum and 30 characters maximum'})
    readonly password?: string;

    @IsString({message: 'The firstName must be a string.'})
    @Length(2, 25, {message: 'The firstName can contain 5 characters minimum and 30 characters maximum'})
    @Matches(/^[A-Z]+[a-zA-z]+$/, {message: 'Incorrect firstname'})
    readonly firstName: string;

    @IsString({message: 'The lastName must be a string.'})
    @Length(2, 25, {message: 'The lastName can contain 5 characters minimum and 30 characters maximum'})
    @Matches(/^[A-Z]+[a-zA-z]+$/, {message: 'Incorrect lastName'})
    readonly lastName?: string;
    
    readonly roleId?: string;
}