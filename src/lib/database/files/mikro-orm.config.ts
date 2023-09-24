import 'dotenv/config'
import {TextType, Type} from "@mikro-orm/core"
import {TsMorphMetadataProvider} from "@mikro-orm/reflection"

export default {
    entities: [],
    entitiesTs: [],
    type: process.env['<%= name.toUpperCase() %>_DB_TYPE'] ?? '<%= type %>',
    dbName: process.env['<%= name.toUpperCase() %>_DB_NAME'] ?? 'database',
    host: process.env['<%= name.toUpperCase() %>_DB_HOST'],
    port: process.env['<%= name.toUpperCase() %>_DB_PORT'] ? +process.env['<%= name.toUpperCase() %>_DB_PORT'] : null,
    user: process.env['<%= name.toUpperCase() %>_DB_USER'],
    password: process.env['<%= name.toUpperCase() %>_DB_PASSWORD'],
    charset: 'UTF-8', // never change!
    timezone: 'GMT', // never change!
    allowGlobalContext: true,
    metadataProvider: TsMorphMetadataProvider,
    cache: {enabled: false},
    migrations: {
        path: './migrations',
        discovery: {
            disableDynamicFileAccess: true,
            getMappedType(type, platform) {
                if (type === 'string') return Type.getType(TextType)
                return platform.getDefaultMappedType(type)
            }
        }
    }
} 