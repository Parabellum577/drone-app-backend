import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: 'mongodb://127.0.0.1:27017/drone-app',
        connectionFactory: (connection: Connection) => {
          connection.on('connected', () => {
            console.log('[MongoDB] Successfully connected');
            if (connection.db) {
              console.log('[MongoDB] Database:', connection.db.databaseName);
            }
          });

          connection.on('disconnected', () => {
            console.log('[MongoDB] Disconnected');
          });

          connection.on('error', (error) => {
            console.error('[MongoDB] Error:', error);
          });

          return connection;
        },
        directConnection: true,
        serverSelectionTimeoutMS: 5000,
      }),
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
