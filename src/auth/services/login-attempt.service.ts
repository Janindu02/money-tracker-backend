import { Injectable } from '@nestjs/common';

interface AttemptRecord {
  count: number;
  lockedUntil?: number;
}

@Injectable()
export class LoginAttemptService {
  private readonly store = new Map<string, AttemptRecord>();
  private readonly maxAttempts = 5;
  private readonly lockDurationMs = 15 * 60 * 1000;

  isLocked(email: string): boolean {
    const key = email.trim().toLowerCase();
    const record = this.store.get(key);
    if (!record?.lockedUntil) return false;

    if (Date.now() >= record.lockedUntil) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  getLockMinutesRemaining(email: string): number {
    const key = email.trim().toLowerCase();
    const record = this.store.get(key);
    if (!record?.lockedUntil) return 0;
    const ms = record.lockedUntil - Date.now();
    return ms > 0 ? Math.ceil(ms / 60000) : 0;
  }

  recordFailure(email: string): void {
    const key = email.trim().toLowerCase();
    const record = this.store.get(key) ?? { count: 0 };
    record.count += 1;

    if (record.count >= this.maxAttempts) {
      record.lockedUntil = Date.now() + this.lockDurationMs;
    }

    this.store.set(key, record);
  }

  reset(email: string): void {
    this.store.delete(email.trim().toLowerCase());
  }
}
