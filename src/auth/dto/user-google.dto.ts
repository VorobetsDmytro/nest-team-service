export interface UserGoogleDto{
    readonly id: string;
    readonly email: string;
    readonly given_name?: string;
    readonly family_name?: string;
    readonly picture?: string;
}