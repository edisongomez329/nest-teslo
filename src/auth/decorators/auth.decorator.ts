import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),    
  );
}

export function AuthFromDocumentationNest(...roles: ValidRoles[]) {
    return applyDecorators(
      
      
      SetMetadata('roles', roles),
      UseGuards(AuthGuard),
      ApiBearerAuth(),
      ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    );
  }

function ApiBearerAuth(): ClassDecorator | MethodDecorator | PropertyDecorator {
    throw new Error('Function not implemented.');
}
function ApiUnauthorizedResponse(arg0: { description: string; }): ClassDecorator | MethodDecorator | PropertyDecorator {
    throw new Error('Function not implemented.');
}

