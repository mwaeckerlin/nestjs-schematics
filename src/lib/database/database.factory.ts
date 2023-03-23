import { join, strings } from '@angular-devkit/core'
import { apply, branchAndMerge, chain, DirEntry, filter, mergeWith, move, noop, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics'

export function main(options: any): Rule {
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
            const { path, content } = read(tree, options, /^main\.[tj]s$/, '/src')
            addLine(content, '  app.get(MikroORM).getMigrator().up()', { after: /^\s*const\s+app\s+=/ })
            addImport(content, "import { MikroORM } from '@mikro-orm/core'")
            tree.overwrite(path, content.join('\n'))
        }

        // update exception-filter.ts
        {
            const { path, content } = read(tree, options, /^exception-filter\.[tj]s$/, '/src')
            addImport(content, "import { NotFoundError } from '@mikro-orm/core'")
            addLine(content, '        if (exception instanceof NotFoundError) exception = new NotFoundException(exception)', { after: /this\.logger/ })
            tree.overwrite(path, content.join('\n'))
        }

        // update tsconfig.json
        {
            const { path, content } = readJson(tree, options, /^package.json$/)
            const dependencies = {
                ...{
                    "@mikro-orm/core": "*",
                    "@mikro-orm/nestjs": "*",
                    "@mikro-orm/migrations": "*",
                    "@mikro-orm/reflection": "*",
                    "uuid": "*"
                },
                ...content.dependencies
            }
            dependencies["@mikro-orm/" + options.type] ??= "*"
            const devDependencies = {
                ...{ "@mikro-orm/cli": "*" },
                ...content.devDependencies
            }
            const scripts = {
                ...{
                    "migration": "mikro-orm migration:create",
                    "migration:initial": "mikro-orm migration:create --initial"
                },
                ...content.scripts
            }
            tree.overwrite(path, JSON.stringify({ ...content, dependencies, devDependencies, scripts }, null, 4))
        }

        // update app.module.ts, add import
        {
            const { path, content } = read(tree, options, /^app\.module\.[tj]s$/, '/src')
            addImport(content, "import { MikroOrmModule } from '@mikro-orm/nestjs'")
            addText(content, 'MikroOrmModule.forRoot(),', /imports:\s*\[/)
            tree.overwrite(path, content.join('\n'))
        }
        return tree
    }
}

const read = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
    const path = find(tree, options, name, dir)
    return { path, content: tree.read(path).toString().split('\n') }
}

const readJson = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
    const path = find(tree, options, name, dir)
    return { path, content: JSON.parse(tree.read(path).toString()) }
}

const find = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
    const entry: DirEntry = tree.getDir((options.dir ?? '') + (dir))
    return join(entry.path, entry.subfiles.find(f => name.test(f))?.valueOf())
}

const addImport = (content: string[], line: string) =>
    addLine(content, line, { afterLast: /^\s*import\s+/ })

const addLine = (content: string[], line: string, where: { after?: RegExp, afterLast?: RegExp, first?, last?}) =>
    content.find(l => l.includes(line.trim()))
        ? content
        : where.after
            ? content.splice(content.findIndex(e => where.after.test(e)) + 1, 0, line)
            : where.afterLast
                ? content.splice(content.findLastIndex(e => where.afterLast.test(e)) + 1, 0, line)
                : where.first
                    ? content.unshift(line)
                    : content.push(line)

const addText = (content: string[], line: string, after: RegExp) =>
    content.find(l => l.includes(line.trim()))
        ? content
        : content.splice(0, content.length, ...content.join('\n').replace(after, x => x + line).split('\n'))

const generate = (options: any) =>
    (context: SchematicContext) =>
        apply(url('./files'), [
            template({
                ...strings,
                ...options,
            }),
            move(options.path ?? '')
        ])(context)