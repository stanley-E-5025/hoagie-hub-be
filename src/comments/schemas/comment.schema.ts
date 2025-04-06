import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Hoagie } from '../../hoagies/schemas/hoagie.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  text: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
  })
  user: User;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Hoagie',
    index: true,
  })
  hoagie: Hoagie;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
