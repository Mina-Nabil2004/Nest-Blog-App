import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity()
export class Blog {
    @PrimaryGeneratedColumn('uuid')
    blogID!: string;

    @Column({ nullable: false })
    title!: string;

    @Column('text', { nullable: false })
    content!: string;

    @Column({ type: 'varchar', nullable: true })
    imageUrl?: string | null;

    @ManyToOne(() => User, (user) => user.blogs, { eager: true })
    author!: User;

    @OneToMany(() => Comment, (comment) => comment.blog)
    comments!: Comment[];

    @ManyToMany(() => Tag, (tag) => tag.blogs, { eager: true })
    @JoinTable()
    tags!: Tag[];

    @Column({ default: false })
    published!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
