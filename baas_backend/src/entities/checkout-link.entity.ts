import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
// import { Order } from './order.entity';

export enum PaymentMethod {
  PIX = 'PIX',
  CARD = 'CARD',
}

export enum CheckoutStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

@Entity('checkout_links')
export class CheckoutLink {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.checkoutLinks)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  title!: string;

  @Column('int')
  amount!: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'enum', enum: CheckoutStatus, default: CheckoutStatus.PENDING })
  status!: CheckoutStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  feePercent!: number;

  @Column({ default: 1 })
  installments!: number;

  @Column({ nullable: true })
  brand?: string;

  @Column({ unique: true })
  externalReference!: string;

  @Column({ type: 'text', nullable: true })
  qrCodeBase64?: string;

  @Column({ type: 'text', nullable: true })
  emv?: string;

  @Column({ nullable: true })
  gatewayPaymentId?: string;

  @Column({ nullable: true })
  expiresAt?: Date;

  // @OneToMany(() => Order, (order) => order.checkoutLink)
  // orders?: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}