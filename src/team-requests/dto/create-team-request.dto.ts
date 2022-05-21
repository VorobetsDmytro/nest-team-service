import { IsString, Length } from "class-validator";
import { ETeamRequestStatusType, ETeamRequestTypes } from "../team-requests.type";

export class CreateTeamRequestDto {
    id?: string;
    requestType?: ETeamRequestTypes;
    userId?: string;

    @IsString({message: 'The teamId must be a string'})
    @Length(1, 40, {message: 'The teamId can contain 1 characters minimum and 40 characters maximum'})
    teamId: string;

    toTeamId?: string;
    status?: ETeamRequestStatusType;
}