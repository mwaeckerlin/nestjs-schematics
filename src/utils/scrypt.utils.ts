import {join} from "@angular-devkit/core"
import {DirEntry, Tree} from "@angular-devkit/schematics"
import * as yaml from 'js-yaml'

export const read = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
  const path = find(tree, options, name, dir)
  return {path, content: tree.read(path).toString().split('\n')}
}

export const readJson = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
  const path = find(tree, options, name, dir)
  return {path, content: JSON.parse(tree.read(path).toString())}
}

export const readYaml = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
  const path = find(tree, options, name, dir)
  return {path, content: yaml.load(tree.read(path).toString())}
}

export const find = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
  const entry: DirEntry = tree.getDir((options.dir ?? '') + (dir))
  return join(entry.path, entry.subfiles.find(f => name.test(f))?.valueOf())
}

export const addImport = (content: string[], line: string) =>
  addLine(content, line, {afterLast: /^\s*import\s+/})

export const addLine = (content: string[], line: string, where: {after?: RegExp, afterLast?: RegExp, first?, last?}) =>
  content.find(l => l.includes(line.trim()))
    ? content
    : where.after
      ? content.splice(content.findIndex(e => where.after.test(e)) + 1, 0, line)
      : where.afterLast
        ? content.splice(content.findLastIndex(e => where.afterLast.test(e)) + 1, 0, line)
        : where.first
          ? content.unshift(line)
          : content.push(line)

export const addText = (content: string[], line: string, after: RegExp, pattern?: RegExp) =>
  content.find(l => pattern ? l.match(pattern) : l.includes(line.trim()))
    ? content
    : content.splice(0, content.length, ...content.join('\n').replace(after, x => x + line).split('\n'))


export const plural = (text, revert) => {

  var plural = {
    '(quiz)$': "$1zes",
    '^(ox)$': "$1en",
    '([m|l])ouse$': "$1ice",
    '(matr|vert|ind)ix|ex$': "$1ices",
    '(x|ch|ss|sh)$': "$1es",
    '([^aeiouy]|qu)y$': "$1ies",
    '(hive)$': "$1s",
    '(?:([^f])fe|([lr])f)$': "$1$2ves",
    '(shea|lea|loa|thie)f$': "$1ves",
    'sis$': "ses",
    '([ti])um$': "$1a",
    '(tomat|potat|ech|her|vet)o$': "$1oes",
    '(bu)s$': "$1ses",
    '(alias)$': "$1es",
    '(octop)us$': "$1i",
    '(ax|test)is$': "$1es",
    '(us)$': "$1es",
    '([^s]+)$': "$1s"
  }

  var singular = {
    '(quiz)zes$': "$1",
    '(matr)ices$': "$1ix",
    '(vert|ind)ices$': "$1ex",
    '^(ox)en$': "$1",
    '(alias)es$': "$1",
    '(octop|vir)i$': "$1us",
    '(cris|ax|test)es$': "$1is",
    '(shoe)s$': "$1",
    '(o)es$': "$1",
    '(bus)es$': "$1",
    '([m|l])ice$': "$1ouse",
    '(x|ch|ss|sh)es$': "$1",
    '(m)ovies$': "$1ovie",
    '(s)eries$': "$1eries",
    '([^aeiouy]|qu)ies$': "$1y",
    '([lr])ves$': "$1f",
    '(tive)s$': "$1",
    '(hive)s$': "$1",
    '(li|wi|kni)ves$': "$1fe",
    '(shea|loa|lea|thie)ves$': "$1f",
    '(^analy)ses$': "$1sis",
    '((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$': "$1$2sis",
    '([ti])a$': "$1um",
    '(n)ews$': "$1ews",
    '(h|bl)ouses$': "$1ouse",
    '(corpse)s$': "$1",
    '(us)es$': "$1",
    's$': ""
  }

  var irregular = {
    'move': 'moves',
    'foot': 'feet',
    'goose': 'geese',
    'sex': 'sexes',
    'child': 'children',
    'man': 'men',
    'tooth': 'teeth',
    'person': 'people'
  }

  var uncountable = [
    'sheep',
    'fish',
    'deer',
    'moose',
    'series',
    'species',
    'money',
    'rice',
    'information',
    'equipment'
  ]

  // save some time in the case that singular and plural are the same
  if (uncountable.indexOf(text.toLowerCase()) >= 0)
    return text

  // check for irregular forms
  for (let word in irregular) {

    if (revert) {
      var pattern = new RegExp(irregular[word] + '$', 'i')
      var replace = word
    } else {
      var pattern = new RegExp(word + '$', 'i')
      var replace = irregular[word]
    }
    if (pattern.test(text))
      return text.replace(pattern, replace)
  }

  const array = revert ? singular : plural

  // check for matches using regular expressions
  for (let reg in array) {

    var pattern = new RegExp(reg, 'i')

    if (pattern.test(text))
      return text.replace(pattern, array[reg])
  }

  return text
}

export const singular = (text: string) => plural(text, true)