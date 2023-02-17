import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// global makes the module avalivable in the whole application
// import are not longer necesary

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
