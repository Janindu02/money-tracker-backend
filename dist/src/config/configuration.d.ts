declare const _default: () => {
    port: number;
    nodeEnv: string;
    frontendUrl: string;
    databaseUrl: string;
    jwt: {
        secret: string | undefined;
        refreshSecret: string | undefined;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    google: {
        clientId: string | undefined;
        clientSecret: string | undefined;
        callbackUrl: string;
    };
    cookie: {
        secure: boolean;
        domain: string | undefined;
    };
    auth: {
        maxSessionsPerUser: number;
        sessionSecret: string | undefined;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
};
export default _default;
