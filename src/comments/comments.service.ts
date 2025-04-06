import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ResourceNotFoundException } from '../common/exceptions/resource-not-found.exception';

export interface PaginatedCommentsResult {
  data: CommentDocument[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<CommentDocument> {
    const newComment = new this.commentModel({
      text: createCommentDto.text,
      user: new Types.ObjectId(createCommentDto.userId),
      hoagie: createCommentDto.hoagieId,
    });

    return newComment.save();
  }

  async findAllByHoagieId(
    hoagieId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedCommentsResult> {
    if (!Types.ObjectId.isValid(hoagieId)) {
      throw new ResourceNotFoundException('Hoagie', hoagieId);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.commentModel
        .find({ hoagie: hoagieId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .exec(),
      this.commentModel.countDocuments({ hoagie: hoagieId }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async delete(id: string, userId: string): Promise<CommentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new ResourceNotFoundException('Comment', id);
    }

    const comment = await this.commentModel
      .findOneAndDelete({ _id: id, user: userId })
      .exec();

    if (!comment) {
      throw new ResourceNotFoundException(
        'Comment',
        `${id} (or you don't have permission to delete it)`,
      );
    }

    return comment;
  }

  async countCommentsByHoagieId(hoagieId: string): Promise<number> {
    if (!Types.ObjectId.isValid(hoagieId)) {
      throw new ResourceNotFoundException('Hoagie', hoagieId);
    }

    return this.commentModel.countDocuments({ hoagie: hoagieId }).exec();
  }
}
