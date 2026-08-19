import { IsEnum } from 'class-validator';
import { TaskStatus } from './execution.schema';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
