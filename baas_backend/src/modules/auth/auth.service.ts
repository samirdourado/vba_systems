import { Injectable, ConflictException, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, GatewayAccount } from '../../entities';
import { LeraBoxService } from '../lera-box/lera-box.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { LoginMerchantDto } from './dto/login-merchant.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,
    private readonly leraBoxService: LeraBoxService,
    private readonly jwtService: JwtService,
  ) {}
  
  async register(dto: RegisterMerchantDto) {
    const cleanDocument = dto.document.replace(/\D/g, '');
    const cleanPhone = dto.phone.replace(/\D/g, '');
    const cleanZipCode = dto.zipCode.replace(/\D/g, '');
    
    const userAlreadyExists = await this.userRepository.findOne({
      where: [{ email: dto.email }, { document: cleanDocument }],
    });

    if (userAlreadyExists) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail ou documento.');
    }
    
    await this.leraBoxService.registerUser({
      personType: dto.personType,
      name: dto.name,
      tradingName: dto.tradingName || dto.name,
      email: dto.email,
      phone: cleanPhone,
      document: cleanDocument,
      zipCode: cleanZipCode,
      address: dto.address,
      number: dto.number,
      complement: dto.complement,
      neighborhood: dto.neighborhood,
      city: dto.city,
      state: dto.state,
    });
    
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      document: cleanDocument,
      phone: cleanPhone,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return {
      message: 'Usuário cadastrado com sucesso! Verifique seu e-mail para as credenciais do gateway.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        document: user.document,
      },
    };
  }

  async login(dto: LoginMerchantDto) {
    const cleanDocument = dto.document.replace(/\D/g, '');

    let gatewayAuth;
    try {
      gatewayAuth = await this.leraBoxService.login(cleanDocument, dto.password);
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas no gateway Lera Box.');
    }

    const user = await this.userRepository.findOne({
      where: { document: cleanDocument },
      relations: { gatewayAccount: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado na base local BaaS.');
    }

    const gatewayToken = gatewayAuth.access_token || gatewayAuth.token;
    const codigoCliente = gatewayAuth.codigoCliente || gatewayAuth.clientCode;
    const chaveLoja = gatewayAuth.chaveLoja || gatewayAuth.storeKey;

    if (user.gatewayAccount) {
      user.gatewayAccount.token = gatewayToken;
      user.gatewayAccount.clientCode = codigoCliente;
      user.gatewayAccount.storeKey = chaveLoja;
      await this.gatewayAccountRepository.save(user.gatewayAccount);
    } else {
      const newAccount = this.gatewayAccountRepository.create({
        token: gatewayToken,
        clientCode: codigoCliente,
        storeKey: chaveLoja,
        user,
      });
      await this.gatewayAccountRepository.save(newAccount);
    }
    
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      document: user.document,
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      codigoCliente,
      chaveLoja,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        document: user.document,
      },
    };
  }

  async getProfile(user: User) {
    if (!user.gatewayAccount?.token) {
      throw new UnauthorizedException('Conta do gateway não vinculada ou token ausente.');
     }  
    return this.leraBoxService.getUserProfile(user.gatewayAccount.token);
  } 
}