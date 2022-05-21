export interface CreateTeamKickDto {
    id?: string;
    userId: string;
    teamId?: string;
    kickReason: string;
    kickedBy?: string;
}