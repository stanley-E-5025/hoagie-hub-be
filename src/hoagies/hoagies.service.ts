import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hoagie, HoagieDocument } from './schemas/hoagie.schema';
import { CreateHoagieDto } from './dto/create-hoagie.dto';
import { UpdateHoagieDto } from './dto/update-hoagie.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { CommentsService } from '../comments/comments.service';
import { ResourceNotFoundException } from '../common/exceptions/resource-not-found.exception';
import { PermissionDeniedException } from '../common/exceptions/permission-denied.exception';

export interface PaginatedHoagiesResult {
  data: HoagieDocument[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class HoagiesService {
  constructor(
    @InjectModel(Hoagie.name) private hoagieModel: Model<HoagieDocument>,
    @Inject(forwardRef(() => CommentsService))
    private commentsService: CommentsService,
  ) {}

  async create(
    createHoagieDto: CreateHoagieDto,
    creator: UserDocument,
  ): Promise<HoagieDocument> {
    const newHoagie = new this.hoagieModel({
      ...createHoagieDto,
      creator: creator._id,
      commentCount: 0,
    });

    return newHoagie.save();
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedHoagiesResult> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.hoagieModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('creator', 'name email')
        .exec(),
      this.hoagieModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOneById(id: string): Promise<HoagieDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new ResourceNotFoundException('Hoagie', id);
    }

    const hoagie = await this.hoagieModel
      .findById(id)
      .populate('creator', 'name email')
      .populate('collaborators', 'name email')
      .exec();

    if (!hoagie) {
      throw new ResourceNotFoundException('Hoagie', id);
    }

    return hoagie;
  }

  async incrementCommentCount(hoagieId: string): Promise<void> {
    if (!Types.ObjectId.isValid(hoagieId)) {
      throw new ResourceNotFoundException('Hoagie', hoagieId);
    }

    await this.hoagieModel
      .updateOne({ _id: hoagieId }, { $inc: { commentCount: 1 } })
      .exec();
  }

  async decrementCommentCount(hoagieId: string): Promise<void> {
    if (!Types.ObjectId.isValid(hoagieId)) {
      throw new ResourceNotFoundException('Hoagie', hoagieId);
    }

    await this.hoagieModel
      .updateOne(
        { _id: hoagieId, commentCount: { $gt: 0 } },
        { $inc: { commentCount: -1 } },
      )
      .exec();
  }

  async updateCommentCount(hoagieId: string): Promise<void> {
    if (!Types.ObjectId.isValid(hoagieId)) {
      throw new ResourceNotFoundException('Hoagie', hoagieId);
    }

    const count = await this.commentsService.countCommentsByHoagieId(hoagieId);

    await this.hoagieModel
      .updateOne({ _id: hoagieId }, { $set: { commentCount: count } })
      .exec();
  }

  async recalculateAllCommentCounts(): Promise<void> {
    const hoagies = await this.hoagieModel.find().exec();

    for (const hoagie of hoagies) {
      await this.updateCommentCount(hoagie._id.toString());
    }
  }

  async addCollaborator(
    hoagieId: string,
    collaboratorId: string,
    requestUserId: string,
  ): Promise<HoagieDocument> {
    if (!Types.ObjectId.isValid(hoagieId)) {
      throw new ResourceNotFoundException('Hoagie', hoagieId);
    }

    const hoagie = await this.hoagieModel.findById(hoagieId);

    if (!hoagie) {
      throw new ResourceNotFoundException('Hoagie', hoagieId);
    }

    if (hoagie.creator.toString() !== requestUserId) {
      throw new PermissionDeniedException(
        'Only the creator can add collaborators to this hoagie',
      );
    }

    const isAlreadyCollaborator = hoagie.collaborators?.some(
      (collaborator) => collaborator.toString() === collaboratorId,
    );

    if (!isAlreadyCollaborator) {
      if (!hoagie.collaborators) {
        hoagie.collaborators = [];
      }

      hoagie.collaborators.push(collaboratorId as any);
      await hoagie.save();
    }

    return this.findOneById(hoagieId);
  }

  async getContributorCount(hoagieId: string): Promise<number> {
    const hoagie = await this.findOneById(hoagieId);

    return 1 + (hoagie.collaborators?.length || 0);
  }

  async updateHoagie(
    id: string,
    updateHoagieDto: UpdateHoagieDto,
    userId: string,
  ): Promise<HoagieDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new ResourceNotFoundException('Hoagie', id);
    }

    const hoagie = await this.hoagieModel.findById(id);

    if (!hoagie) {
      throw new ResourceNotFoundException('Hoagie', id);
    }

    const isCreator = hoagie.creator.toString() === userId;
    const isCollaborator = hoagie.collaborators?.some(
      (collaborator) => collaborator.toString() === userId,
    );

    if (!isCreator && !isCollaborator) {
      throw new PermissionDeniedException(
        'Only the creator or collaborators can edit this hoagie',
      );
    }

    Object.assign(hoagie, updateHoagieDto);

    return hoagie.save();
  }

  async removeCollaborator(
    hoagieId: string,
    collaboratorId: string,
    userId: string,
  ): Promise<HoagieDocument> {
    if (!Types.ObjectId.isValid(hoagieId)) {
      throw new ResourceNotFoundException('Hoagie', hoagieId);
    }

    const hoagie = await this.hoagieModel.findById(hoagieId);

    if (!hoagie) {
      throw new ResourceNotFoundException('Hoagie', hoagieId);
    }

    if (hoagie.creator.toString() !== userId) {
      throw new PermissionDeniedException(
        'Only the creator can remove collaborators',
      );
    }

    if (hoagie.collaborators) {
      hoagie.collaborators = hoagie.collaborators.filter(
        (collaborator) => collaborator.toString() !== collaboratorId,
      );

      await hoagie.save();
    }

    return this.findOneById(hoagieId);
  }
}
