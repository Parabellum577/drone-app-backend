import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    const port = process.env.PORT || 3000;

    await app.listen(port, '0.0.0.0', () => {
      console.log(`[Server] Running on port: ${port}`);
      console.log(`[API] Available at: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('[Server] Startup error:', error);
    process.exit(1);
  }
}

bootstrap();
