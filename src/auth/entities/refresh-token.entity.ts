import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    tokenID!: string;

    @Column({ nullable: false })
    token!: string;

    @ManyToOne(() => User, (user) => user.refreshTokens, { eager: true })
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: 'timestamp', nullable: false })
    expiresAt!: Date;
}
