import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('webhook_events')
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  eventId!: string;

  @Column()
  eventType!: string;

  @Column('json')
  payload!: any;

  @Column({ default: false })
  processed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}