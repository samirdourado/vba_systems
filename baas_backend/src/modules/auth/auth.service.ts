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
      this.logger.error(`Falha na autenticação da Lera Box para o documento: ${cleanDocument}`);
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    
    const user = await this.userRepository.findOne({
      where: { document: cleanDocument },
      relations: { gatewayAccount: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    
    if (user.gatewayAccount) {
      user.gatewayAccount.token = gatewayAuth.token;
      user.gatewayAccount.clientCode = gatewayAuth.clientCode;
      user.gatewayAccount.storeKey = gatewayAuth.storeKey;
      await this.gatewayAccountRepository.save(user.gatewayAccount);
    } else {
      const newGatewayAccount = this.gatewayAccountRepository.create({
        token: gatewayAuth.token,
        clientCode: gatewayAuth.clientCode,
        storeKey: gatewayAuth.storeKey,
        user,
      });
      await this.gatewayAccountRepository.save(newGatewayAccount);
    }
    
    const isPasswordInSync = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordInSync) {
      user.password = await bcrypt.hash(dto.password, 10);
      await this.userRepository.save(user);
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      clientCode: gatewayAuth.clientCode,
      storeKey: gatewayAuth.storeKey,
    }); 

    return {
      access_token: accessToken,
      token_type: gatewayAuth.token_type,
      codigoCliente: gatewayAuth.codigoCliente,
      chaveLoja: gatewayAuth.chaveLoja,
      user: {
        id: gatewayAuth.user.id,
        personType: gatewayAuth.user.personType,
        name: gatewayAuth.user.name,
        tradingName: gatewayAuth.user.tradingName,
        email: gatewayAuth.user.email,
        document: gatewayAuth.user.document,
      },
  }
}
  
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { gatewayAccount: true },
    });

    if (!user) {
      throw new NotFoundException('Merchant not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      document: user.document,
      gatewayAccount: user.gatewayAccount
        ? {
            clientCode: user.gatewayAccount.clientCode,
            storeKey: user.gatewayAccount.storeKey,
          }
        : null,
    };
  }
}