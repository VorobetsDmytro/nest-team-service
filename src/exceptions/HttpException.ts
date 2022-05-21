export class HttpException {
    constructor(public message: any, public statusCode: number){}
}

export enum HttpExceptionMessages {
    UserWasNotFound = 'The user was not found.',
    EmailInUse = 'This email is already in use.',
    LoginInUse = 'This login is already in use.',
    CreatingUser = 'Error creating user.',
    NoAccess = 'No access.',
    TeamWasNotFound = 'The team was not found.',
    IncorrectData = 'Incorrect data.',
    InvalidLink = 'Invalid link.'
}