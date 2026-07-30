import { PartialType } from '@nestjs/swagger';
import { CreateHelpResourceDto } from './create-help-resource.dto';

export class UpdateHelpResourceDto extends PartialType(CreateHelpResourceDto) {}
