import { TsMorphMetadataProvider } from "@mikro-orm/reflection"

export default {
    entities: [
        'dist/src/**/entities/*.entity.js'
    ],
    entitiesTs: [
        'src/**/entities/*.entity.ts'
    ],
    type: process.env.DB_TYPE ?? '<%= type %>',
    dbName: process.env.DB_NAME ?? 'database.'+(process.env.DB_TYPE ?? '<%= type %>'),
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? +process.env.DB_PORT : null,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: 'UTF-8', // never change!
    timezone: 'GMT', // never change!
    metadataProvider: TsMorphMetadataProvider,
    migrations: {
        path: 'migrations',
    }
} 