import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { UserDocument } from '../../users/schemas/user.schema';

export type HoagieDocument = HydratedDocument<Hoagie>;

@Schema({ timestamps: true })
export class Hoagie {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, type: [String] })
  ingredients: string[];

  @Prop()
  picture?: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
  })
  creator: UserDocument;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  collaborators?: UserDocument[];

  @Prop({ type: Number, default: 0 })
  commentCount: number;
}

export const HoagieSchema = SchemaFactory.createForClass(Hoagie);
