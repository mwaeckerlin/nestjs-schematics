import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing'
import * as path from 'path'
import {SubAppOptions} from './sub-app.schema'

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
      '/backends/scrypt-swiss-nest-templates/tsconfig.json',
      "/backends/project/.dockerignore",
      "/backends/project/.gitignore",
      "/backends/project/.prettierrc",
      "/backends/project/Dockerfile",
      "/backends/project/README.md",
      "/backends/project/docker-compose.yaml",
      "/backends/project/nest-cli.json",
      "/backends/project/package.json",
      "/backends/project/src/app.module.ts",
      "/backends/project/src/exception-filter.ts",
      "/backends/project/src/main.ts",
      "/backends/project/test/app.e2e-spec.ts",
      "/backends/project/test/jest-e2e.json",
      "/backends/project/tsconfig.build.json",
      "/backends/project/tsconfig.json"].sort())
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
      "/backends/awesome-project/.dockerignore",
      "/backends/awesome-project/.gitignore",
      "/backends/awesome-project/.prettierrc",
      "/backends/awesome-project/Dockerfile",
      "/backends/awesome-project/README.md",
      "/backends/awesome-project/docker-compose.yaml",
      "/backends/awesome-project/nest-cli.json",
      "/backends/awesome-project/package.json",
      "/backends/awesome-project/src/app.module.ts",
      "/backends/awesome-project/src/exception-filter.ts",
      "/backends/awesome-project/src/main.ts",
      "/backends/awesome-project/test/app.e2e-spec.ts",
      "/backends/awesome-project/test/jest-e2e.json",
      "/backends/awesome-project/tsconfig.build.json",
      "/backends/awesome-project/tsconfig.json",
      "/backends/scrypt-swiss-nest-templates/tsconfig.json",
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
      "/backends/_project/.dockerignore",
      "/backends/_project/.gitignore",
      "/backends/_project/.prettierrc",
      "/backends/_project/Dockerfile",
      "/backends/_project/README.md",
      "/backends/_project/docker-compose.yaml",
      "/backends/_project/nest-cli.json",
      "/backends/_project/package.json",
      "/backends/_project/src/app.module.ts",
      "/backends/_project/src/exception-filter.ts",
      "/backends/_project/src/main.ts",
      "/backends/_project/test/app.e2e-spec.ts",
      "/backends/_project/test/jest-e2e.json",
      "/backends/_project/tsconfig.build.json",
      "/backends/_project/tsconfig.json",
      "/backends/scrypt-swiss-nest-templates/tsconfig.json",
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
      "/backends/project/.babelrc",
      "/backends/project/.dockerignore",
      "/backends/project/.gitignore",
      "/backends/project/.prettierrc",
      "/backends/project/Dockerfile",
      "/backends/project/README.md",
      "/backends/project/docker-compose.yaml",
      "/backends/project/index.js",
      "/backends/project/jsconfig.json",
      "/backends/project/nest-cli.json",
      "/backends/project/nodemon.json",
      "/backends/project/package.json",
      "/backends/project/src/app.module.js",
      "/backends/project/src/exception-filter.js",
      "/backends/project/src/main.js",
      "/backends/project/test/app.e2e-spec.js",
      "/backends/project/test/jest-e2e.json",
      "/backends/scrypt-swiss-nest-templates/.babelrc",
      "/backends/scrypt-swiss-nest-templates/index.js",
      "/backends/scrypt-swiss-nest-templates/jsconfig.json",
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
      "/backends/project/.dockerignore",
      "/backends/project/.gitignore",
      "/backends/project/.prettierrc",
      "/backends/project/Dockerfile",
      "/backends/project/README.md",
      "/backends/project/docker-compose.yaml",
      "/backends/project/nest-cli.json",
      "/backends/project/package.json",
      "/backends/project/src/app.module.ts",
      "/backends/project/src/exception-filter.ts",
      "/backends/project/src/main.ts",
      "/backends/project/test/app.e2e-spec.ts",
      "/backends/project/test/jest-e2e.json",
      "/backends/project/tsconfig.build.json",
      "/backends/project/tsconfig.json",
      "/backends/scrypt-swiss-nest-templates/tsconfig.json",
      "/nest-cli.json",
    ].sort())
  })
})
