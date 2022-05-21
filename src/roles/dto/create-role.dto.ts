import { IsString, Length } from "class-validator";

export class CreateRoleDto {
    id?: string;

    @IsString({message: 'The value must be a string.'})
    @Length(2, 20, {message: 'The login can contain 5 characters minimum and 30 characters maximum'})
    value: string;
}