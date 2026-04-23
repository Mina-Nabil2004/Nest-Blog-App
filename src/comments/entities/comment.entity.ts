import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Blog } from '../../blogs/entities/blog.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    commentID!: string;

    @Column({ nullable: false })
    content!: string;

    @ManyToOne(() => User, (user) => user.comments, { eager: true })
    author!: User;

    @ManyToOne(() => Blog, (blog) => blog.comments, { eager: true })
    blog!: Blog;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
