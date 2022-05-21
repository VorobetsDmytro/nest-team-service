import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){
    constructor(){
        super({
            clientID: process.env.PASSPORT_CLIENT_ID || 'clientid',
            clientSecret: process.env.PASSPORT_CLIENT_SECRET || 'clientsecret',
            callbackURL: process.env.PASSPORT_CALLBACK_URL || 'callbackurl',
            passReqToCallback: true,
            scope: ['email', 'profile']
        });
    }

    async validate(request: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback){
        return done(null, profile);
    }
}