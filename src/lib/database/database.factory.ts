import {strings} from '@angular-devkit/core'
import {apply, branchAndMerge, chain, DirEntry, filter, mergeWith, move, noop, Rule, SchematicContext, template, Tree, url} from '@angular-devkit/schematics'
import {read, readJson, readYaml, addImport, addLine, addText} from '../../utils/scrypt.utils'
import * as yaml from 'js-yaml'

export function main(options: any): Rule {
    options.name ??= options.sourceRoot?.split('/')?.[1] ?? process.cwd()?.split('/')?.pop()
    return (tree: Tree, _context: SchematicContext) =>
        chain([
            branchAndMerge(
                chain([
                    mergeWith(generate(options)),
                    change(options)
                ]))
        ])
}

export function change(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        // update main.ts
        {
            const {path, content} = read(tree, options, /^main\.[tj]s$/, '/src')
            content.join('\n').replace(/(bootstrap\(AppModule, name, port)(, *{(.*)}( *))?\)/, (a, p1, p2, p3) => `${p1}, {${'orb: true' + (p3 ? ', ' + p3 : '')}})`).split('\n')
            tree.overwrite(path, content.join('\n'))
        }

        // update package.json
        let NAME, name
        {
            const {path, content} = readJson(tree, options, /^package.json$/)
            NAME = content.name.toUpperCase().replace(/-/g, '_').replace(/.*\//g, '')
            name = NAME.toLowerCase()
            const scripts = {
                ...{
                    "migration": "mikro-orm migration:create",
                    "migration:initial": "mikro-orm migration:create --initial",
                    "migration:up": "mikro-orm migration:up",
                    "migration:down": "mikro-orm migration:down"
                },
                ...content.scripts
            }
            tree.overwrite(path, JSON.stringify({
                ...content, scripts,
                "mikro-orm": {
                    "useTsNode": true,
                    "configPaths": [
                        "./dist/mikro-orm.config.js",
                    ]
                }
            }, null, 4))
        }

        // update docker-compose.yaml
        let config
        {
            const {path, content} = readYaml(tree, options, /^docker-compose.yaml$/)
            content.services.backend.environment = {
                ...{
                    [NAME + "_DB_TYPE"]: options.type,
                    [NAME + "_DB_NAME"]: "database",
                    [NAME + "_DB_HOST"]: "db",
                    [NAME + "_DB_USER"]: "user",
                    [NAME + "_DB_PASSWORD"]: pwgen(),
                    [NAME + "_DB_PORT"]: options.type === 'postgresql' ? 5432 : options.type === 'mysql' || options.type === 'mariadb' ? 3306 : null
                },
                ...content.services.backend.environment
            }
            content.services.backend.networks ??= []
            content.services.backend.networks.push('db-network')
            switch (content.services.backend.environment[NAME + "_DB_TYPE"]) {
                case 'postgresql':
                    content.services.db = {
                        image: content.services.backend.environment[NAME + "_DB_TYPE"],
                        ports: [
                            '${' + NAME + '_DB_PORT}:${' + NAME + '_DB_PORT}'
                        ],
                        environment: {
                            [NAME + "POSTGRES_PASSWORD"]: content.services.backend.environment[NAME + "_DB_PASSWORD"],
                            [NAME + "POSTGRES_USER"]: content.services.backend.environment[NAME + "_DB_USER"],
                            [NAME + "POSTGRES_DB"]: content.services.backend.environment[NAME + "_DB_NAME"]
                        },
                        volumes: [{
                            type: "volume",
                            source: name + "-db-volume",
                            target: "/var/lib/postgresql/data"
                        }],
                        networks: [
                            name + "-db-network"
                        ]
                    }
                    break
                case 'mysql':
                    content.services.db = {
                        image: content.services.backend.environment[NAME + "_DB_TYPE"],
                        ports: [
                            content.services.backend.environment[NAME + "_DB_PORT"] + ':' + content.services.backend.environment[NAME + "_DB_PORT"]
                        ],
                        environment: {
                            [NAME + "MYSQL_ROOT_PASSWORD"]: pwgen(40),
                            [NAME + "MYSQL_PASSWORD"]: content.services.backend.environment[NAME + "_DB_PASSWORD"],
                            [NAME + "MYSQL_USER"]: content.services.backend.environment[NAME + "_DB_USER"],
                            [NAME + "MYSQL_DATABASE"]: content.services.backend.environment[NAME + "_DB_NAME"]
                        },
                        volumes: [{
                            type: "volume",
                            source: name + "-db-volume",
                            target: "/var/lib/mysql"
                        }],
                        networks: [
                            name + "-db-network"
                        ]
                    }
                    break
                case 'mariadb':
                    content.services.db = {
                        image: content.services.backend.environment[NAME + "_DB_TYPE"],
                        ports: [
                            content.services.backend.environment[NAME + "_DB_PORT"] + ':' + content.services.backend.environment[NAME + "_DB_PORT"]
                        ],
                        environment: {
                            [NAME + "MARIADB_ROOT_PASSWORD"]: pwgen(40),
                            [NAME + "MARIADB_PASSWORD"]: content.services.backend.environment[NAME + "_DB_PASSWORD"],
                            [NAME + "MARIADB_USER"]: content.services.backend.environment[NAME + "_DB_USER"],
                            [NAME + "MARIADB_DATABASE"]: content.services.backend.environment[NAME + "_DB_NAME"]
                        },
                        volumes: [{
                            type: "volume",
                            source: name + "-db-volume",
                            target: "/var/lib/mysql"
                        }],
                        networks: [
                            name + "db-network"
                        ]
                    }
                    break
                case 'mongo':
                    content.services.db = {
                        image: content.services.backend.environment[NAME + "_DB_TYPE"],
                        environment: {
                            [NAME + "MONGO_INITDB_ROOT_PASSWORD"]: content.services.backend.environment[NAME + "_DB_PASSWORD"],
                            [NAME + "MONGO_INITDB_ROOT_USERNAME"]: content.services.backend.environment[NAME + "_DB_USER"],
                        },
                        volumes: [{
                            type: "volume",
                            source: name + "-db-volume",
                            target: "/data/db"
                        }],
                        networks: [
                            name + "-db-network"
                        ]
                    }
                    break
                case 'sqlite':
                    break
                default:
                    throw new Error('Unknown Database Type: ' + content.services.backend.environment[NAME + "_DB_TYPE"])
                    break
            }
            content.volumes = {
                ...{
                    [name + "-db-volume"]: {}
                },
                ...content.volumes
            }
            content.networks = {
                ...{
                    [name + "-db-network"]: {driver_opts: {encrypted: 1}}
                },
                ...content.networks
            }
            tree.overwrite(path, yaml.dump({...content}))
            config = content.services.backend.environment
        }

        // set local test environment in .env
        {
            if (!tree.exists('/.env')) tree.create('/.env', '')
            const {path, content} = read(tree, options, /^.env$/)
            addLine(content, NAME + '_DB_TYPE=' + config[NAME + "_DB_TYPE"], {last: true})
            addLine(content, NAME + '_DB_NAME=' + config[NAME + "_DB_NAME"], {last: true})
            addLine(content, NAME + '_DB_HOST="127.0.0.1"', {last: true})
            addLine(content, NAME + '_DB_USER=' + config[NAME + "_DB_USER"], {last: true})
            addLine(content, NAME + '_DB_PASSWORD=' + config[NAME + "_DB_PASSWORD"], {last: true})
            addLine(content, NAME + '_DB_PORT=' + config[NAME + "_DB_PORT"], {last: true})
            tree.overwrite(path, content.join('\n'))
        }

        // update app.module.ts, add import
        {
            const {path, content} = read(tree, options, /^app\.module\.[tj]s$/, '/src')
            addImport(content, "import { MikroOrmModule } from '@mikro-orm/nestjs'")
            addImport(content, "import mikroOrmConfig from '../mikro-orm.config'")
            addText(content, 'MikroOrmModule.forRoot({...(mikroOrmConfig as {})}),', /\s+imports:\s*\[/)
            tree.overwrite(path, content.join('\n'))
        }
        return tree
    }
}

const generate = (options: any) =>
    (context: SchematicContext) =>
        apply(url('./files'), [
            template({
                ...strings,
                ...options,
            }),
            move(options.path ?? '')
        ])(context)

const pwgen = (length = 10, characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.:,;+") =>
    ".".repeat(length).split('').map(() =>
        characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('')
