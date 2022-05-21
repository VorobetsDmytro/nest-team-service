import { ETeamRequestStatusType, ETeamRequestTypes } from "../team-requests/team-requests.type";
import { RoleTypes } from '../roles/roles.type';

export class GeneratorDto{
    constructor(private prefix: string, 
                private index: number = 0){}
    generateUserDto() {
        ++this.index;
        return {
            email: `${this.prefix}user${this.index}@test.com`,
            login: `${this.prefix}user${this.index}`,
            password: `${this.prefix}user${this.index}`,
            firstName: "User",
            lastName: "User",
            id: `${this.prefix}user${this.index}`
        }
    }
    generateBanDto(bannedById: string, bannedId: string) {
        ++this.index;
        return {
            id: `${this.prefix}ban${this.index}`,
            banReason: 'Spam',
            bannedBy: bannedById,
            userId: bannedId
        }
    }
    generateTeamDto() {
        ++this.index;
        return {
            teamName: `${this.prefix}team${this.index}`,
            id: `${this.prefix}team${this.index}`
        }
    }
    generateTeamRequestDto(requestType: ETeamRequestTypes, userId: string, teamId: string, toTeamId: string | undefined = undefined) {
        ++this.index;
        return {
            id: `${this.prefix}teamRequest${this.index}`,
            requestType,
            userId,
            teamId,
            toTeamId,
            status: ETeamRequestStatusType.AWAITING,
        }
    }
    generateTeamRequestApprovementDto(teamRequestId: string, fromTeamId: string, toTeamId: string) {
        ++this.index;
        return {
            id: `${this.prefix}teamRequestApprovement${this.index}`,
            teamRequestId,
            fromTeamId,
            toTeamId
        }
    }
    generateRoleDto(roleType: RoleTypes){
        ++this.index;
        return {
            id: `${this.prefix}role${this.index}`,
            value: this.prefix + roleType + this.index
        }
    }
    generateChangeProfileDto(){
        ++this.index;
        return {
            avatar: `avatar.png`,
            login: `${this.prefix}newlogin${this.index}`,
            password: 'newpassword'
        }
    }
};