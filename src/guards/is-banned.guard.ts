import { CanActivate, ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/sequelize";
import { Ban } from "../bans/bans.model";
import { User } from "../users/users.model";

@Injectable()
export class IsBannedGuard implements CanActivate {
    constructor(private jwtService: JwtService,
                @InjectModel(User) private userRepository: typeof User){}

    async canActivate(context: ExecutionContext) {
        try {
            const req = context.switchToHttp().getRequest();
            const token = req.headers.authorization?.split(' ')[1];
            if(!token)
                throw new HttpException('No authorization', 401)
            const userJwt = this.jwtService.verify<Express.User>(token);
            if(!userJwt)
                throw new HttpException('No authorization', 401)
            const user = await this.userRepository.findOne({where: {email: userJwt.email}, include: [Ban]});
            if(!user)
                throw new HttpException('No authorization', 401)
            if(user.bans.length > 0){
                const lastBan = user.bans[user.bans.length - 1];
                if(!lastBan.unBannedAt)
                    throw new HttpException(`BANNED! By: <${lastBan.bannedBy}> Reason: ${lastBan.banReason}`, 403);
            }
            return true;
        } catch (error) {
            if(error instanceof HttpException)
                throw error;
            throw new HttpException('No authorization', 401);
        }
    }
}