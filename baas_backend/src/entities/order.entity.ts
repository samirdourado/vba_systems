import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CheckoutLink } from './checkout-link.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  checkoutLinkId!: string;

  @ManyToOne(() => CheckoutLink, (link) => link.orders)
  @JoinColumn({ name: 'checkoutLinkId' })
  checkoutLink!: CheckoutLink;

  @Column('int')
  amount!: number;

  @Column({ default: 'PENDING' })
  status!: string;

  @Column({ nullable: true })
  payerName?: string;

  @Column({ nullable: true })
  payerEmail?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}