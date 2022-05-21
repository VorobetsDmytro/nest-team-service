declare namespace NodeJS {
    export interface ProcessEnv {
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

declare namespace Express {
    namespace Multer {
        /** Object containing file metadata and access information. */
        interface File {
            /** Name of the form field associated with this file. */
            fieldname: string;
            /** Name of the file on the uploader's computer. */
            originalname: string;
            /**
             * Value of the `Content-Transfer-Encoding` header for this file.
             * @deprecated since July 2015
             * @see RFC 7578, Section 4.7
             */
            encoding: string;
            /** Value of the `Content-Type` header for this file. */
            mimetype: string;
            /** Size of the file in bytes. */
            size: number;
            /**
             * A readable stream of this file. Only available to the `_handleFile`
             * callback for custom `StorageEngine`s.
             */
            stream: Readable;
            /** `DiskStorage` only: Directory to which this file has been uploaded. */
            destination: string;
            /** `DiskStorage` only: Name of this file within `destination`. */
            filename: string;
            /** `DiskStorage` only: Full path to the uploaded file. */
            path: string;
            /** `MemoryStorage` only: A Buffer containing the entire file. */
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