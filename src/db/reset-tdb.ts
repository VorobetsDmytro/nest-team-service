import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'nodemailer/lib/xoauth2';
import { AppModule } from '../app.module';
import dbInstance from "../db/instantiate-sequelize";
import { RolesService } from '../roles/roles.service';
import { RoleTypes } from '../roles/roles.type';

declare global{
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number;
            BASE_URL: string;
            WS_PORT: number;
            WS_HOST: string;
            JWT_SECRET: string;
            SESSION_SECRET: string;
            STATIC_PATH: string;
            POSTGRES_HOST: string;
            POSTGRES_PORT: number;
            POSTGRES_USER: string;
            POSTGRES_PASSWORD: string;
            POSTGRES_DB: string;
            EMAIL_HOST: string;
            EMAIL_PORT: number;
            EMAIL_USER: string;
            EMAIL_PASS: string;
            PASSPORT_CLIENT_ID: string;
            PASSPORT_CLIENT_SECRET: string;
            PASSPORT_CALLBACK_URL: string;
        }
    }
    namespace Express {
        namespace Multer {
            interface File {
                fieldname: string;
                originalname: string;
                encoding: string;
                mimetype: string;
                size: number;
                stream: Readable;
                destination: string;
                filename: string;
                path: string;
                buffer: Buffer;
            }
        }
        export interface User {
            id: string;
            email: string;
            isGoogleAccount: boolean;
            role: string;
            bans: [];
        }
    }
}

(async () => {
    console.log('Reseting the DB...');
    const module: TestingModule = await Test.createTestingModule({
        imports: [
            AppModule
        ]
    }).compile();
    const rolesService = module.get<RolesService>(RolesService);
    await dbInstance.truncate({cascade: true});
    await rolesService.createRole({id: RoleTypes.PLAYER, value: RoleTypes.PLAYER});
    await rolesService.createRole({id: RoleTypes.MANAGER, value: RoleTypes.MANAGER});
    await rolesService.createRole({id: RoleTypes.ADMIN, value: RoleTypes.ADMIN});
    process.exit(0);
})();