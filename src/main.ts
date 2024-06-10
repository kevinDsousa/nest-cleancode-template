import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Envs } from './env/envs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    //logger: false,
  });

  const configService: ConfigService<Envs, true> = app.get(ConfigService);
  const port = configService.get('PORT', { infer: true });
  await app.listen(port);
}
bootstrap();
