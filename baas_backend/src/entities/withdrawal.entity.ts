import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  // @ManyToOne(() => User, (user) => user.withdrawals)
  // @JoinColumn({ name: 'userId' })
  // user!: User;

  @Column('int')
  amount!: number;

  @Column()
  pixKey!: string;

  @Column({ nullable: true })
  pixKeyType?: string;

  @Column({ type: 'enum', enum: WithdrawalStatus, default: WithdrawalStatus.PENDING })
  status!: WithdrawalStatus;

  @Column({ nullable: true })
  gatewayWithdrawalId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}