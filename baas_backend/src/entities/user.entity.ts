import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { GatewayAccount } from './gateway-account.entity';
import { CheckoutLink } from './checkout-link.entity';
import { Withdrawal } from './withdrawal.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  document?: string;

  @OneToOne(() => GatewayAccount, (account) => account.user, { cascade: true })
  gatewayAccount?: GatewayAccount;

  @OneToMany(() => CheckoutLink, (link) => link.user)
  checkoutLinks?: CheckoutLink[];

  @OneToMany(() => Withdrawal, (withdrawal) => withdrawal.user)
  withdrawals?: Withdrawal[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}