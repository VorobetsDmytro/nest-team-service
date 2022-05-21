import { IsString, Length } from "class-validator";

export class CreateTeamDto {
    readonly id?: string;

    @IsString({message: 'The teamName must be a string'})
    @Length(2, 20, {message: 'The teamName can contain 2 characters minimum and 20 characters maximum'})
    readonly teamName: string;
}