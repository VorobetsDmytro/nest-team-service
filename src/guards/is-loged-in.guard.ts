import { CanActivate, ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class IsLogedInGuard implements CanActivate {
    constructor(private jwtService: JwtService){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const req = context.switchToHttp().getRequest();
            const token = req.headers.authorization?.split(' ')[1];
            if(!token)
                throw new HttpException('No authorization', 401)
            const user= this.jwtService.verify<Express.User>(token);
            if(!user)
                throw new HttpException('No authorization', 401)
            req.user = user;
            return true;
        } catch (error) {
            if(error instanceof HttpException)
                throw error;
            throw new HttpException('No authorization', 401);
        }
    }
}