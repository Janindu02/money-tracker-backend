import { createApp } from './server';

async function bootstrap() {
  const server = await createApp();
  const port = parseInt(process.env.PORT ?? '3001', 10);
  server.listen(port, () => {
    console.log(`Finova API running on http://localhost:${port}`);
    console.log(`Swagger docs at http://localhost:${port}/api/docs`);
  });
}

void bootstrap();
