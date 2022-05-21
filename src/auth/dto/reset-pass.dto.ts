import { IsString, Length } from "class-validator";

export class ResetPassDto{
    @IsString({message: 'The password must be a string.'})
    @Length(5, 30, {message: 'The password can contain 5 characters minimum and 30 characters maximum'})
    readonly password: string;
}