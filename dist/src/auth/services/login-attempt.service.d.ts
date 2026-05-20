export declare class LoginAttemptService {
    private readonly store;
    private readonly maxAttempts;
    private readonly lockDurationMs;
    isLocked(email: string): boolean;
    getLockMinutesRemaining(email: string): number;
    recordFailure(email: string): void;
    reset(email: string): void;
}
