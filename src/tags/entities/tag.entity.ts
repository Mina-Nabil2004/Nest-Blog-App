import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Blog } from '../../blogs/entities/blog.entity';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn('uuid')
    tagID!: string;

    @Column({ nullable: false })
    name!: string;

    @ManyToMany(() => Blog, (blog) => blog.tags)
    blogs!: Blog[];
}
