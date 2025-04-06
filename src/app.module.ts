import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { HoagiesModule } from './hoagies/hoagies.module';
import { CommentsModule } from './comments/comments.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 500,
      },
      {
        name: 'hoagieCreation',
        ttl: 60000,
        limit: 5,
      },
      {
        name: 'hoagieUpdate',
        ttl: 60000,
        limit: 10,
      },
      {
        name: 'userCreation',
        ttl: 60000,
        limit: 3,
      },
      {
        name: 'userSearch',
        ttl: 60000,
        limit: 20,
      },
      {
        name: 'commentCreation',
        ttl: 60000,
        limit: 10,
      },
      {
        name: 'commentDeletion',
        ttl: 60000,
        limit: 10,
      },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    HoagiesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
