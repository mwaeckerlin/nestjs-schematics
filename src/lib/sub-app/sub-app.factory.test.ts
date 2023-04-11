import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing'
import * as path from 'path'
import { SubAppOptions } from './sub-app.schema'

describe('SubApp Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  )
  it('should manage name only', async () => {
    const options: SubAppOptions = {
      name: 'project',
    }
    const tree: UnitTestTree = await runner
      .runSchematicAsync('sub-app', options)
      .toPromise()
    const files: string[] = tree.files
    expect(files.sort()).toEqual([
      '/nest-cli.json',
      '/apps/scrypt-swiss-nest-templates/tsconfig.app.json',
      "/apps/project/.dockerignore",
      "/apps/project/.eslintrc.js",
      "/apps/project/.gitignore",
      "/apps/project/.prettierrc",
      "/apps/project/Dockerfile",
      "/apps/project/README.md",
      "/apps/project/docker-compose.yml",
      "/apps/project/nest-cli.json",
      "/apps/project/package.json",
      "/apps/project/src/app.module.ts",
      "/apps/project/src/exception-filter.ts",
      "/apps/project/src/main.ts",
      "/apps/project/test/app.e2e-spec.ts",
      "/apps/project/test/jest-e2e.json",
      "/apps/project/tsconfig.build.json",
      "/apps/project/tsconfig.app.json"].sort())
  })
  it('should manage name to normalize', async () => {
    const options: SubAppOptions = {
      name: 'awesomeProject',
    }
    const tree: UnitTestTree = await runner
      .runSchematicAsync('sub-app', options)
      .toPromise()
    const files: string[] = tree.files
    expect(files.sort()).toEqual([
      "/apps/awesome-project/.dockerignore",
      "/apps/awesome-project/.eslintrc.js",
      "/apps/awesome-project/.gitignore",
      "/apps/awesome-project/.prettierrc",
      "/apps/awesome-project/Dockerfile",
      "/apps/awesome-project/README.md",
      "/apps/awesome-project/docker-compose.yml",
      "/apps/awesome-project/nest-cli.json",
      "/apps/awesome-project/package.json",
      "/apps/awesome-project/src/app.module.ts",
      "/apps/awesome-project/src/exception-filter.ts",
      "/apps/awesome-project/src/main.ts",
      "/apps/awesome-project/test/app.e2e-spec.ts",
      "/apps/awesome-project/test/jest-e2e.json",
      "/apps/awesome-project/tsconfig.build.json",
      "/apps/awesome-project/tsconfig.app.json",
      "/apps/scrypt-swiss-nest-templates/tsconfig.app.json",
      "/nest-cli.json",
    ].sort())
  })
  it("should keep underscores in sub-app's path and file name", async () => {
    const options: SubAppOptions = {
      name: '_project',
    }
    const tree: UnitTestTree = await runner
      .runSchematicAsync('sub-app', options)
      .toPromise()
    const files: string[] = tree.files
    expect(files.sort()).toEqual([
      "/apps/_project/.dockerignore",
      "/apps/_project/.eslintrc.js",
      "/apps/_project/.gitignore",
      "/apps/_project/.prettierrc",
      "/apps/_project/Dockerfile",
      "/apps/_project/README.md",
      "/apps/_project/docker-compose.yml",
      "/apps/_project/nest-cli.json",
      "/apps/_project/package.json",
      "/apps/_project/src/app.module.ts",
      "/apps/_project/src/exception-filter.ts",
      "/apps/_project/src/main.ts",
      "/apps/_project/test/app.e2e-spec.ts",
      "/apps/_project/test/jest-e2e.json",
      "/apps/_project/tsconfig.build.json",
      "/apps/_project/tsconfig.app.json",
      "/apps/scrypt-swiss-nest-templates/tsconfig.app.json",
      "/nest-cli.json",].sort())
  })
  it('should manage javascript files', async () => {
    const options: SubAppOptions = {
      name: 'project',
      language: 'js',
    }
    const tree: UnitTestTree = await runner
      .runSchematicAsync('sub-app', options)
      .toPromise()
    const files: string[] = tree.files
    expect(files.sort()).toEqual([
      "/apps/project/.babelrc",
      "/apps/project/.dockerignore",
      "/apps/project/.gitignore",
      "/apps/project/.prettierrc",
      "/apps/project/Dockerfile",
      "/apps/project/README.md",
      "/apps/project/docker-compose.yml",
      "/apps/project/index.js",
      "/apps/project/jsconfig.json",
      "/apps/project/nest-cli.json",
      "/apps/project/nodemon.json",
      "/apps/project/package.json",
      "/apps/project/src/app.module.js",
      "/apps/project/src/exception-filter.js",
      "/apps/project/src/main.js",
      "/apps/project/test/app.e2e-spec.js",
      "/apps/project/test/jest-e2e.json",
      "/apps/scrypt-swiss-nest-templates/.babelrc",
      "/apps/scrypt-swiss-nest-templates/index.js",
      "/apps/scrypt-swiss-nest-templates/jsconfig.json",
      "/nest-cli.json",
    ].sort())
  })
  it('should generate spec files with custom suffix', async () => {
    const options: SubAppOptions = {
      name: 'project',
      specFileSuffix: 'test',
    }
    const tree: UnitTestTree = await runner
      .runSchematicAsync('sub-app', options)
      .toPromise()
    const files: string[] = tree.files
    expect(files.sort()).toEqual([
      "/apps/project/.dockerignore",
      "/apps/project/.eslintrc.js",
      "/apps/project/.gitignore",
      "/apps/project/.prettierrc",
      "/apps/project/Dockerfile",
      "/apps/project/README.md",
      "/apps/project/docker-compose.yml",
      "/apps/project/nest-cli.json",
      "/apps/project/package.json",
      "/apps/project/src/app.module.ts",
      "/apps/project/src/exception-filter.ts",
      "/apps/project/src/main.ts",
      "/apps/project/test/app.e2e-spec.ts",
      "/apps/project/test/jest-e2e.json",
      "/apps/project/tsconfig.build.json",
      "/apps/project/tsconfig.app.json",
      "/apps/scrypt-swiss-nest-templates/tsconfig.app.json",
      "/nest-cli.json",
    ].sort())
  })
})
