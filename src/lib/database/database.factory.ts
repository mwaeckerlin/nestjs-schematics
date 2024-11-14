import {strings} from '@angular-devkit/core'
import {apply, branchAndMerge, chain, mergeWith, move, Rule, SchematicContext, template, Tree, url} from '@angular-devkit/schematics'
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
            tree.overwrite(path, content.join('\n').replace(/(bootstrap\(AppModule, name, port)(, *{(.*)}( *))?\)/, (a, p1, p2, p3) => `${p1}, {${'orm: true, kafka: kafka.main' + (p3 ? ', ' + p3 : '')}})`))
        }

        // update package.json
        let NAME, name
        {
            const {path, content} = readJson(tree, options, /^package.json$/)
            NAME = content.name.toUpperCase().replace(/-/g, '_').replace(/.*\//g, '')
            name = content.name.replace(/.*\//g, '').toLowerCase()
            const scripts = {
                ...{
                    "premigration": "npm run build",
                    "migration": "mikro-orm migration:create",
                    "migration:initial": "mikro-orm migration:create --initial",
                    "migration:up": "mikro-orm migration:up",
                    "migration:down": "mikro-orm migration:down",
                    "clean:all": "rimraf node_modules temp",
                    "migration:reset": "rimraf migrations dist; git checkout migrations",
                    "db:cache": "mikro-orm cache:generate",
                    "postmigration": "npm run doc",
                    "postbuild": "npm run db:cache",
                    "predoc": "node ../../scripts/mikroorm2puml.js",
                    "doc": "plantuml -tpng -o img doc"
                },
                ...content.scripts
            }
            tree.overwrite(path, JSON.stringify({
                ...content, scripts,
                devDependencies: {
                    "@mikro-orm/cli": "",
                    ...content.devDependencies,
                },
                "mikro-orm": {
                    "useTsNode": true,
                    "configPaths": [
                        "./dist/mikro-orm.config.js",
                    ]
                }
            }, null, 4))
        }

        // update docker-compose.yaml
        options.port =
            options.type === 'postgresql' ? 5432
                : options.type === 'mysql' || options.type === 'mariadb' ? 3306
                    : options.type === 'mongo' ? 27017
                        : null
        options.randomport = 5000 + Math.floor(Math.random() * 1000)
        options.password = pwgen(40)
        {
            const {path, content} = readYaml(tree, options, /^docker-compose.yaml$/)
            content.services[name].environment = {
                ...{
                    [NAME + "_DB_TYPE"]: null,
                    [NAME + "_DB_NAME"]: null,
                    [NAME + "_DB_HOST"]: name + '-db',
                    [NAME + "_DB_USER"]: null,
                    [NAME + "_DB_PASSWORD"]: null,
                    [NAME + "_DB_PORT"]: options.port
                },
                ...content.services[name].environment
            }
            content.services[name].networks ??= []
            content.services[name].networks.push(name + '-db')
            switch (options.type) {
                case 'postgresql':
                    content.services[name + '-db'] = {
                        image: 'postgres',
                        ports: [
                            '${' + NAME + '_DB_PORT}:' + options.port
                        ],
                        environment: {
                            ["POSTGRES_PASSWORD"]: '${' + NAME + "_DB_PASSWORD" + '}',
                            ["POSTGRES_USER"]: '${' + NAME + "_DB_USER" + '}',
                            ["POSTGRES_DB"]: '${' + NAME + "_DB_NAME" + '}${ENVIRONMENT}'
                        },
                        volumes: [{
                            type: "volume",
                            source: name + "-db",
                            target: "/var/lib/postgresql/data"
                        }],
                        networks: [
                            name + "-db"
                        ]
                    }
                    break
                case 'mysql':
                    content.services[name + '-db'] = {
                        image: 'mysql',
                        ports: [
                            '${' + NAME + '_DB_PORT}:' + options.port
                        ],
                        environment: {
                            ["MYSQL_ROOT_PASSWORD"]: pwgen(40),
                            ["MYSQL_PASSWORD"]: '${' + NAME + "_DB_PASSWORD" + '}',
                            ["MYSQL_USER"]: '${' + NAME + "_DB_USER" + '}',
                            ["MYSQL_DATABASE"]: '${' + NAME + "_DB_NAME" + '}${ENVIRONMENT}'
                        },
                        volumes: [{
                            type: "volume",
                            source: name + "-db",
                            target: "/var/lib/mysql"
                        }],
                        networks: [
                            name + "-db"
                        ]
                    }
                    break
                case 'mariadb':
                    content.services[name + '-db'] = {
                        image: 'mariadb',
                        ports: [
                            '${' + NAME + '_DB_PORT}:' + options.port
                        ],
                        environment: {
                            ["MARIADB_ROOT_PASSWORD"]: pwgen(40),
                            ["MARIADB_PASSWORD"]: '${' + NAME + "_DB_PASSWORD" + '}',
                            ["MARIADB_USER"]: '${' + NAME + "_DB_USER" + '}',
                            ["MARIADB_DATABASE"]: '${' + NAME + "_DB_NAME" + '}${ENVIRONMENT}'
                        },
                        volumes: [{
                            type: "volume",
                            source: name + "-db",
                            target: "/var/lib/mysql"
                        }],
                        networks: [
                            name + "-db"
                        ]
                    }
                    break
                case 'mongo':
                    content.services[name + '-db'] = {
                        image: 'mongo',
                        ports: [
                            '${' + NAME + '_DB_PORT}:' + options.port
                        ],
                        environment: {
                            ["MONGO_INITDB_ROOT_PASSWORD"]: '${' + NAME + "_DB_PASSWORD" + '}',
                            ["MONGO_INITDB_ROOT_USERNAME"]: '${' + NAME + "_DB_USER" + '}',
                        },
                        volumes: [{
                            type: "volume",
                            source: name + "-db",
                            target: "/data/db"
                        }],
                        networks: [
                            name + "-db"
                        ]
                    }
                    break
                case 'sqlite':
                    break
                default:
                    throw new Error('Unknown Database Type: ' + options.type)
            }
            content.volumes = {
                ...{
                    [name + "-db"]: {}
                },
                ...content.volumes
            }
            content.networks = {
                ...{
                    [name + "-db"]: {driver_opts: {encrypted: 1}}
                },
                ...content.networks
            }
            tree.overwrite(path, yaml.dump({...content}, {styles: {'!!null': 'empty'}}))
        }

        // set local test environment in .env.sample
        {
            if (!tree.exists('/.env.sample')) tree.create('/.env.sample', '')
            const {path, content} = read(tree, options, /^.env.sample$/)
            addLine(content, NAME + '_DB_TYPE=' + options.type, {last: true})
            addLine(content, NAME + '_DB_NAME=' + name, {last: true})
            addLine(content, NAME + '_DB_HOST="127.0.0.1"', {last: true})
            addLine(content, NAME + '_DB_USER=' + name, {last: true})
            addLine(content, NAME + '_DB_PASSWORD=RANDOM_PASSWORD', {last: true})
            addLine(content, NAME + '_DB_PORT=' + options.randomport, {last: true})
            tree.overwrite(path, content.join('\n'))
        }

        // update app.module.ts, add import
        {
            const {path, content} = read(tree, options, /^app\.module\.[tj]s$/, '/src')
            addImport(content, "import { MikroOrmModule } from '@mikro-orm/nestjs'")
            addImport(content, "import mikroOrmConfig from '../mikro-orm.config'")
            addText(content, 'MikroOrmModule.forRoot({...mikroOrmConfig}),', /\s+imports:\s*\[/)
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
