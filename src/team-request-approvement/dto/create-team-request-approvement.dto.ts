export interface CreateTeamRequestApprovementDto {
    id: string;
    teamRequestId: string;
    fromTeamId: string;
    toTeamId: string;
}