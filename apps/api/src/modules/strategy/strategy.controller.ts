import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { StrategyService } from './strategy.service';
import { ScenarioService } from './scenario.service';
import { ChallengeService } from './challenge.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PlanLimitGuard, SetPlanRequirement } from '../plans/plan-limit.guard';
import type { UserDocument } from '../users/user.schema';

@Controller('businesses/:businessId/strategy')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class StrategyController {
  constructor(
    private readonly service: StrategyService,
    private readonly scenarioService: ScenarioService,
    private readonly challengeService: ChallengeService,
  ) {}

  @Post()
  @UseGuards(PlanLimitGuard)
  @SetPlanRequirement('strategy')
  generate(@Param('businessId') businessId: string, @CurrentUser() user: UserDocument) {
    return this.service.generate(businessId, user._id.toString(), user.plan);
  }

  @Post('scenarios')
  @UseGuards(PlanLimitGuard)
  @SetPlanRequirement('strategy')
  compareScenarios(
    @Param('businessId') businessId: string,
    @CurrentUser() user: UserDocument,
    @Body() body: { question: string; scenarios: string[] },
  ) {
    return this.scenarioService.compare(businessId, user._id.toString(), user.plan, body.question, body.scenarios);
  }

  @Post('challenge')
  @UseGuards(PlanLimitGuard)
  @SetPlanRequirement('strategy')
  challenge(
    @Param('businessId') businessId: string,
    @CurrentUser() user: UserDocument,
    @Body() body: { strategyStatement: string },
  ) {
    return this.challengeService.challenge(businessId, user._id.toString(), user.plan, body.strategyStatement);
  }
}

