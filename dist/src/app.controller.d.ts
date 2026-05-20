export declare class AppController {
    root(): {
        status: string;
        service: string;
        version: string;
        endpoints: {
            health: string;
            docs: string;
            api: string;
        };
    };
    favicon(): void;
    faviconPng(): void;
}
