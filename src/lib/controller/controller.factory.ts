import {join, Path, strings} from '@angular-devkit/core'
import {classify} from '@angular-devkit/core/src/utils/strings'
import {
  apply,
  branchAndMerge,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics'
import {normalizeToKebabOrSnakeCase} from '../../utils/formatting'
import {
  DeclarationOptions,
  ModuleDeclarator,
} from '../../utils/module.declarator'
import {ModuleFinder} from '../../utils/module.finder'
import {Location, NameParser} from '../../utils/name.parser'
import {mergeSourceRoot} from '../../utils/source-root.helpers'
import {DEFAULT_LANGUAGE} from '../defaults'
import {ControllerOptions} from './controller.schema'

const ELEMENT_METADATA = 'controllers'
const ELEMENT_TYPE = 'controller'

export function main(options: ControllerOptions): Rule {
  options = transform(options)
  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([
        mergeSourceRoot(options),
        mergeWith(generate(options)),
        addDeclarationToModule(options),
      ]),
    )(tree, context)
  }
}

function transform(source: ControllerOptions): ControllerOptions {
  const target: ControllerOptions = Object.assign({}, source)
  target.metadata = ELEMENT_METADATA
  target.type = ELEMENT_TYPE

  const location: Location = new NameParser().parse(target)
  target.name = normalizeToKebabOrSnakeCase(location.name)
  target.path = normalizeToKebabOrSnakeCase(location.path)
  target.language =
    target.language !== undefined ? target.language : DEFAULT_LANGUAGE

  target.specFileSuffix = normalizeToKebabOrSnakeCase(
    source.specFileSuffix || 'spec',
  )

  target.path = target.flat
    ? target.path
    : join(target.path as Path, target.name)
  return target
}

function generate(options: ControllerOptions) {
  return (context: SchematicContext) => {
    return apply(url(join('./files' as Path, options.language)), [
      options.spec
        ? noop()
        : filter((path) => {
          console.log({path})
          const languageExtension = options.language || 'ts'
          const suffix = `.__specFileSuffix__.${languageExtension}`
          return !path.endsWith(suffix)
        }),
      template({
        ...strings,
        ...options,
        lowercased: (name: string) => {
          const classifiedName = classify(name)
          return (
            classifiedName.charAt(0).toLowerCase() + classifiedName.slice(1)
          )
        }
      }),
      move(options.path),
    ])(context)
  }
}

function addDeclarationToModule(options: ControllerOptions): Rule {
  return (tree: Tree) => {
    if (options.skipImport !== undefined && options.skipImport) {
      return tree
    }
    options.module = new ModuleFinder(tree).find({
      name: options.name,
      path: options.path as Path,
    })
    if (!options.module) {
      return tree
    }
    const content = tree.read(options.module).toString()
    const declarator: ModuleDeclarator = new ModuleDeclarator()
    tree.overwrite(
      options.module,
      declarator.declare(content, options as DeclarationOptions),
    )
    return tree
  }
}
