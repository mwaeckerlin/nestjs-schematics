import { join, Path, PathFragment, template } from '@angular-devkit/core';
import { apply, branchAndMerge, chain, DirEntry, filter, mergeWith, move, noop, Rule, SchematicContext, Tree, url } from '@angular-devkit/schematics';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '../../utils/dependencies.utils';

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
            content.splice(content.findIndex(e => /^\s*const\s+app\s+=/.test(e)) + 1, 0, '  app.app.get(MikroORM).getMigrator().up()')
            content.splice(content.findLastIndex(e => /^\s*import/.test(e)) + 1, 0, "import { MikroORM } from '@mikro-orm/core'")
            tree.overwrite(path, content.join('\n'))
        }

        // update tsconfig.json
        {
            addPackageJsonDependency(tree, { name: '@mikro-orm/core' } as NodeDependency)
            addPackageJsonDependency(tree, { name: '@mikro-orm/nestjs' } as NodeDependency)
            addPackageJsonDependency(tree, { name: '@mikro-orm/' + options.type } as NodeDependency)
            addPackageJsonDependency(tree, { name: '@mikro-orm/migrations' } as NodeDependency)
            addPackageJsonDependency(tree, { name: '@mikro-orm/reflection' } as NodeDependency)
        }

        // update app.module.ts, add import
        {
            const { path, content } = read(tree, options, /^app\.module\.[tj]s$/, '/src')
            content.splice(content.findLastIndex(e => /^\s*import/.test(e)) + 1, 0, "import { MikroORMModule } from '@mikro-orm/nestjs'")
            content.splice(content.findLastIndex(e => /^\s*import/.test(e)) + 1, 0, "import { TsMorphMetadataProvider } from '@mikro-orm/reflection'")
            tree.overwrite(path, content.join('\n').replace(/imports:\s*\[/, 'imports: [MikroOrmModule.forRoot(),'))
        }
        return tree;
    }
}

const read = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
    const path = find(tree, options, name, dir)
    return { path, content: tree.read(path).toString().split('\n') }
}

const find = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
    const entry: DirEntry = tree.getDir((options.dir ?? '') + (dir))
    return join(entry.path, entry.subfiles.find(f => name.test(f))?.valueOf())
}

function generate(options: any) {
    return (context: SchematicContext) =>
        apply(url('./files'), [move(options.path),])(context);
}