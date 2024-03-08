import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {

  }

  /**
   * 
   * @param createUserDto este metod inserta, pero no espera o no ejecuta los @BeforeInsert(), @BeforeUpdate()
   * @returns 
   */
  async insert(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto;

      const hash = bcrypt.hashSync(password, 10);

      const user = { password: hash, ...userData };

      await this.userRepository.insert(user);

      delete user.password;
      
      return { 
        ...user, 
        //token: this.getJwtToken({email: user.email})
        //token: this.getJwtToken({id: user.id}) falla por que aqui no se tiene el id del user
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto;

      const hash = bcrypt.hashSync(password, 10);

      //const user = { password: hash, ...userData };

      const user = await this.userRepository.create({
        ...userData,
        password//: hash
      });

      await this.userRepository.save(user);

      delete user.password;
      
      return { 
        ...user, 
        //token: this.getJwtToken({email: user.email})
        token: this.getJwtToken({id: user.id})
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {

      const { password, email } = loginUserDto;

      const isEquals = bcrypt.compareSync(password, "$2b$10$3E2YU9Zlh6/DakIc6eYrpuWzs7TMw2gQ9/Umgre/2sZYY7whHEEhS");

      const user = await this.userRepository.findOne({
        where: {
          email
        },
        select: { email: true, password: true, id: true }
      })

      if (!user) {
        throw new UnauthorizedException(`Credentilas not valid`)
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException(`Credentilas not valid`)
      }

      return { 
        ...user, 
        //token: this.getJwtToken({email: user.email})
        token: this.getJwtToken({id: user.id})
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async checkAuthStatus(user: User) {
    //throw new Error('Method not implemented.');
    return { 
      ...user, 
      token: this.getJwtToken({id: user.id})
    };

  }


  private getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    
    return token;
  }

  async loginfindOneBy(loginUserDto: LoginUserDto) {
    try {

      const { password, email } = loginUserDto;

      const isEquals = bcrypt.compareSync(password, "$2b$10$3E2YU9Zlh6/DakIc6eYrpuWzs7TMw2gQ9/Umgre/2sZYY7whHEEhS");

      const user = await this.userRepository.findOneBy({
        email
      })

      return { isEquals, user };
      //TODO: retornar JWT de acceso
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');

  }

  
}
