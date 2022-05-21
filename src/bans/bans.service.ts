import { Injectable } from '@nestjs/common';
import { Ban } from "./bans.model";
import { CreateBanDto } from "./dto/create-ban.dto";
import * as uuid from 'uuid';

@Injectable()
export class BansService {
    async generateBanId(){
        let ban: Ban | null, id: string;
        do {
            id = uuid.v4();
            ban = await Ban.findByPk(id);
        } while (ban);
        return id;
    }

    async createBan(dto: CreateBanDto): Promise<Ban> {
        return Ban.create(dto);
    }

    async unban(ban: Ban): Promise<Ban> {
        ban.unBannedAt = new Date(Date.now());
        await ban.save();
        return ban;
    }
}
