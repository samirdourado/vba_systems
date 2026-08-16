import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum PaymentMethod {
  PIX = 'PIX',
  CARD = 'CARD',
}

export enum CheckoutStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity('checkout_links')
export class CheckoutLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'external_reference', unique: false })
  externalReference: string;

  @Column({ type: 'int', comment: 'Valor em centavos' })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'int', default: 1 })
  installments: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  feePercent: number;

  @Column({ type: 'varchar', nullable: true })
  brand?: string;

  @Column({ type: 'enum', enum: CheckoutStatus, default: CheckoutStatus.PENDING })
  status: CheckoutStatus;

  @Column({ type: 'varchar', nullable: true })
  gatewayPaymentId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'merchant_id' })
  merchant: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}