import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LeraBoxService } from './lera-box.service';

@Module({
  imports: [HttpModule],
  providers: [LeraBoxService],
  exports: [LeraBoxService],
})
export class LeraBoxModule {}