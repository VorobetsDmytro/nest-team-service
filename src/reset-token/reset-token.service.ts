import { Injectable } from "@nestjs/common";
import { v4 } from "uuid";
import { ResetToken } from "./reset-token.model";

@Injectable()
export class TokenService {
    async getTokenByUserId(userId: string): Promise<ResetToken | null> {
        return ResetToken.findOne({where: {userId}});
    }

    async createToken(userId: string, value: string): Promise<ResetToken>{
        return ResetToken.create({
            userId,
            value
        });
    }

    async getTokenByUserIdAndTokenVal(userId: string, value: string): Promise<ResetToken | null>{
        return ResetToken.findOne({where: {
            userId,
            value
        }});
    }

    async generateResetToken(): Promise<string> {
        let role: ResetToken | null, id: string;
        do {
            id = v4();
            role = await ResetToken.findByPk(id);
        } while (role);
        return id;
    }

    async deleteResetToken(resetToken: ResetToken): Promise<void> {
        return resetToken.destroy();
    }
}