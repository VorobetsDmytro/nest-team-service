import { JwtPayload } from "jsonwebtoken";

export interface jwtPayloadDto extends JwtPayload {
    id: string;
    email: string;
    isGoogleAccount: boolean;
    role: string;
}