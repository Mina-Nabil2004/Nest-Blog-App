import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Blog } from '../../blogs/entities/blog.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    userID!: string;

    @Column({ nullable: false })
    name!: string;

    @Column({ unique: true, nullable: false })
    email!: string;

    @Column({ nullable: false })
    passwordHash!: string;

    @Column({
        type: 'enum',
        enum: ['BASIC', 'ADMIN'],
        default: 'BASIC',
    })
    role!: 'BASIC' | 'ADMIN';

    @OneToMany(() => Blog, (blog) => blog.author)
    blogs!: Blog[];

    @OneToMany(() => Comment, (comment) => comment.author)
    comments!: Comment[];

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens!: RefreshToken[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
