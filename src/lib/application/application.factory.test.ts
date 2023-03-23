import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing'
import * as path from 'path'
import { ApplicationOptions } from './application.schema'

const expected_files = [
  '.dockerignore',
  '.eslintrc.js',
  '.gitignore',
  '.prettierrc',
  'Dockerfile',
  'README.md',
  'docker-compose.yml',
  'nest-cli.json',
  'package.json',
  'tsconfig.build.json',
  'tsconfig.json',
  'src/app.module.ts',
  'src/exception-filter.ts',
  'src/main.ts',
  'test/app.e2e-spec.ts',
  'test/jest-e2e.json',
]

const expected_jsfiles = [
  ".babelrc",
  '.dockerignore',
  ".gitignore",
  ".prettierrc",
  'Dockerfile',
  'README.md',
  'docker-compose.yml',
  "index.js",
  "jsconfig.json",
  "nest-cli.json",
  "nodemon.json",
  "package.json",
  "src/app.module.js",
  "src/exception-filter.js",
  "src/main.js",
  "test/app.e2e-spec.js",
  "test/jest-e2e.json",
]

describe('Application Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  )
  describe('when only the name is supplied', () => {
    it('should manage basic (ie., cross-platform) name', async () => {
      const options: ApplicationOptions = {
        name: 'project',
      }
      const tree: UnitTestTree = await runner
        .runSchematicAsync('application', options)
        .toPromise()
      const files: string[] = tree.files
      const expectation = expected_files.map(x => '/project/' + x)
      expect(files).toEqual(expectation)

      expect(
        JSON.parse(tree.readContent('/project/package.json')),
      ).toMatchObject({
        name: 'project',
      })
    })
    it('should manage name with dots in it', async () => {
      const options: ApplicationOptions = {
        name: 'project.foo.bar',
      }
      const tree: UnitTestTree = await runner
        .runSchematicAsync('application', options)
        .toPromise()
      const files: string[] = tree.files
      const expectation = expected_files.map(x => '/project.foo.bar/' + x)
      expect(files).toEqual(expectation)

      expect(
        JSON.parse(tree.readContent('/project.foo.bar/package.json')),
      ).toMatchObject({
        name: 'project.foo.bar',
      })
    })
    it('should manage name to normalize from camel case name', async () => {
      const options: ApplicationOptions = {
        name: 'awesomeProject',
      }
      const tree: UnitTestTree = await runner
        .runSchematicAsync('application', options)
        .toPromise()
      const files: string[] = tree.files
      const expectation = expected_files.map(x => '/awesome-project/' + x)
      expect(files).toEqual(expectation)

      expect(
        JSON.parse(tree.readContent('/awesome-project/package.json')),
      ).toMatchObject({
        name: 'awesome-project',
      })
    })
    it('should keep underscores', async () => {
      const options: ApplicationOptions = {
        name: '_awesomeProject',
      }
      const tree: UnitTestTree = await runner
        .runSchematicAsync('application', options)
        .toPromise()
      const files: string[] = tree.files
      const expectation = expected_files.map(x => '/_awesome-project/' + x)
      expect(files).toEqual(expectation)

      expect(
        JSON.parse(tree.readContent('/_awesome-project/package.json')),
      ).toMatchObject({
        name: '_awesome-project',
      })
    })
    it('should manage basic name that has no scope name in it but starts with "@"', async () => {
      const options: ApplicationOptions = {
        name: '@/package',
      }
      const tree: UnitTestTree = await runner
        .runSchematicAsync('application', options)
        .toPromise()
      const files: string[] = tree.files
      const expectation = expected_files.map(x => '/@/package/' + x)
      expect(files).toEqual(expectation)

      expect(
        JSON.parse(tree.readContent('/@/package/package.json')),
      ).toMatchObject({
        name: 'package',
      })
    })
    it('should manage the name "." (ie., current working directory)', async () => {
      const options: ApplicationOptions = {
        name: '.',
      }
      const tree: UnitTestTree = await runner
        .runSchematicAsync('application', options)
        .toPromise()
      const files: string[] = tree.files
      const expectation = expected_files.map(x => '/' + x)
      expect(files).toEqual(expectation)

      expect(JSON.parse(tree.readContent('/package.json'))).toMatchObject({
        name: path.basename(process.cwd()),
      })
    })
    describe('and it meant to be a scoped package', () => {
      describe('that leads to a valid scope name', () => {
        it('should manage basic name', async () => {
          const options: ApplicationOptions = {
            name: '@scope/package',
          }
          const tree: UnitTestTree = await runner
            .runSchematicAsync('application', options)
            .toPromise()
          const files: string[] = tree.files
          const expectation = expected_files.map(x => '/@scope/package/' + x)
          expect(files).toEqual(expectation)

          expect(
            JSON.parse(tree.readContent('/@scope/package/package.json')),
          ).toMatchObject({
            name: '@scope/package',
          })
        })
        it('should manage name with blank space right after the "@" symbol', async () => {
          const options: ApplicationOptions = {
            name: '@ /package',
          }
          const tree: UnitTestTree = await runner
            .runSchematicAsync('application', options)
            .toPromise()
          const files: string[] = tree.files
          const expectation = expected_files.map(x => '/@-/package/' + x)
          expect(files).toEqual(expectation)

          expect(
            JSON.parse(tree.readContent('/@-/package/package.json')),
          ).toMatchObject({
            name: '@-/package',
          })
        })
      })
    })
  })
  it('should manage name as number', async () => {
    const options: ApplicationOptions = {
      name: 123,
    }
    const tree: UnitTestTree = await runner
      .runSchematicAsync('application', options)
      .toPromise()
    const files: string[] = tree.files
    const expectation = expected_files.map(x => '/123/' + x)
    expect(files).toEqual(expectation)

    expect(
      JSON.parse(tree.readContent('/123/package.json')),
    ).toMatchObject({
      name: '123',
    })
  })
  it('should manage javascript files', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      language: 'js',
    }
    const tree: UnitTestTree = await runner
      .runSchematicAsync('application', options)
      .toPromise()
    const files: string[] = tree.files
    const expectation = expected_jsfiles.map(x => '/project/' + x)
    expect(files).toEqual(expectation)

    expect(JSON.parse(tree.readContent('/project/package.json'))).toMatchObject(
      {
        name: 'project',
      },
    )
  })
  it('should manage destination directory', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      directory: 'app',
    }
    const tree: UnitTestTree = await runner
      .runSchematicAsync('application', options)
      .toPromise()
    const files: string[] = tree.files
    const expectation = expected_files.map(x => '/app/' + x)
    expect(files).toEqual(expectation)

    expect(JSON.parse(tree.readContent('/app/package.json'))).toMatchObject({
      name: 'project',
    })
  })
})
