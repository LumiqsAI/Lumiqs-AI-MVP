import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { AIModule } from './modules/ai/ai.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { MarketResearchModule } from './modules/market-research/market-research.module';
import { CompetitorsModule } from './modules/competitors/competitors.module';
import { StrategyModule } from './modules/strategy/strategy.module';
import { ExecutionModule } from './modules/execution/execution.module';
import { ReportsModule } from './modules/reports/reports.module';
import { InsightsModule } from './modules/insights/insights.module';
import { MemoryModule } from './modules/memory/memory.module';
import { StorageModule } from './modules/storage/storage.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    BusinessesModule,
    ConversationsModule,
    AIModule,
    AnalysisModule,
    MarketResearchModule,
    CompetitorsModule,
    StrategyModule,
    ExecutionModule,
    ReportsModule,
    InsightsModule,
    MemoryModule,
    StorageModule,
    HealthModule,
  ],
})
export class AppModule {}
