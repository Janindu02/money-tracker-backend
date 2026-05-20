import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsNumber()
  PORT?: number;

  @IsString()
  @IsNotEmpty()
  FRONTEND_URL!: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  const databaseUrl = validated.DATABASE_URL;
  const onVercel = Boolean(process.env.VERCEL);
  if (onVercel && /localhost|127\.0\.0\.1/.test(databaseUrl)) {
    throw new Error(
      'DATABASE_URL points to localhost. In Vercel → Project → Settings → Environment Variables, set DATABASE_URL to your Neon connection string (Production + Preview), then redeploy.',
    );
  }

  return validated;
}
