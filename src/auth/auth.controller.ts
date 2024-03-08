import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { IncomingHttpHeaders } from 'http';

import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { GetUser, GetRawHeaders, Auth } from './decorators';
import { AuthService } from './auth.service';
import { ValidRoles } from './interfaces/valid-roles';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { META_ROLES, RoleProtected } from './decorators/role-protected.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {

    return this.authService.login(loginUserDto);

  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user);//userId
  }

  @Get()
  @UseGuards(AuthGuard())
  testingPrivateRoute(

    @GetUser() user: User,
    @GetUser('email') email: string,
    @GetRawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders) {

    console.log({ rawHeaders });


    return {
      ok: true,
      message: user,
      email,
      rawHeaders,
      headers
    }
  }

  @Get('private')
  @SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  testiPrivateRoutes(

    @GetUser() user: User) {

    console.log({ user });


    return {
      ok: true,
      message: user
    }
  }


  @Get('testwithroles')
  @RoleProtected(ValidRoles.superUser, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testPrivateWithCustomDecoratorRoles(
  ) {
    return {
      ok: true,
      message: "user"
    }
  }

  /**
   * Con @Req es una forma muy facil y sencilla de obtener el request que llega en cada peticion Http, de aqui podemos obtener el usuario mediante el token,
   * los headers, etc.
   * @param request 
   * @returns 
   */
  @Get('test-request')
  @UseGuards(AuthGuard())
  testingPrivateRouteTest(@Req() request: Express.Request) {

    console.log(request.user);

    return {
      ok: true,
      message: 'test'
    }
  }

  @Get('privateDecoratorsUnified')
  @Auth(ValidRoles.superUser, ValidRoles.user)
  testPrivateDecoratorsUnified(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      message: user
    }
  }

}