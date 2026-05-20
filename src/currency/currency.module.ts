import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
