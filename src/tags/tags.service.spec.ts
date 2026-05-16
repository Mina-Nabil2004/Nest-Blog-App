import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(Tag)
        private readonly tagsRepository: Repository<Tag>,
    ) {}

    async createTag(createTagDto: CreateTagDto): Promise<TagDto> {
        const existing = await this.tagsRepository.findOne({
            where: { name: createTagDto.name },
        });
        if (existing) {
            throw new BadRequestException('Tag with this name already exists');
        }
        const tag = this.tagsRepository.create(createTagDto);
        return this.tagsRepository.save(tag);
    }

    async getAllTags(): Promise<TagDto[]> {
        return this.tagsRepository.find();
    }

    async getTagById(tagID: string): Promise<TagDto> {
        const tag = await this.tagsRepository.findOneBy({ tagID });
        if (!tag) {
            // NotFoundException (404) is correct for a missing resource, not BadRequestException (400)
            throw new NotFoundException('Tag not found');
        }
        return tag;
    }

    async updateTag(
        tagID: string,
        updateTagDto: UpdateTagDto,
    ): Promise<TagDto> {
        const tag = await this.tagsRepository.findOneBy({ tagID });
        if (!tag) {
            throw new NotFoundException('Tag not found');
        }
        Object.assign(tag, updateTagDto);
        return this.tagsRepository.save(tag);
    }

    async deleteTag(tagID: string): Promise<void> {
        const tag = await this.tagsRepository.findOneBy({ tagID });
        if (!tag) {
            throw new NotFoundException('Tag not found');
        }
        await this.tagsRepository.remove(tag);
    }

    // Tag-owned: "which blogs have this tag?" — belongs here because the parent resource is the tag
    async getBlogsByTag(tagID: string): Promise<Blog[]> {
        const tag = await this.tagsRepository.findOne({
            where: { tagID },
            relations: ['blogs'],
        });
        if (!tag) {
            throw new NotFoundException('Tag not found');
        }
        return tag.blogs;
    }
}
