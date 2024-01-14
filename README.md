<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/schematics.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/schematics.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/schematics.svg" alt="NPM Downloads" /></a>
  <a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>

## Changes to Original

The origin of this project is: https://github.com/nestjs/schematics

The application files have been adapted according to the descriptions [in my blog](https://marc.wäckerlin.ch/computer/nestjs-mikroorm).

Additional generators:

 - `database` or `db`: add MikroORM based database connection
   - `type` defines the default database type, e.g. `sqlite`
 - `openapi` or `api`: Generate a server (Controller + DTO) from a OpenAPI 3 JSON file
   - first commandline parameter: file name of the OpenAPI JSON
   - second command line parameter: name of the controller (optional, otherwise, contoler name is taken from first path element)
 - `kafka`: add kafka connection (not started yet)

Also Generates:

  - `Dockerfile`
  - `docker-compose.yaml`

### Install:

    npm i -g @mwaeckerlin/schematics

### Usage:

    nest new -c @mwaeckerlin/schematics [options] [name]

### Example:

    nest new -c @mwaeckerlin/schematics -p npm -l ts test
    cd test
    npm install
    npm run start:debug

Or:

    docker-compose up --build

### Add Database

Create a database, run initial migration (if you don't use SQLitem then you need to run a database with `docker-compose up -d db` for the initial migration):

    nest new -c @mwaeckerlin/schematics -p npm test
    cd test
    nest g -c @mwaeckerlin/schematics db
    nest g -c @mwaeckerlin/schematics res user
    npm install
    npm run build
    docker-compose up -d db
    npm run migration:initial
    docker-compose up

If you get:

```
  code: 'ER_ACCESS_DENIED_ERROR',
  errno: 1045,
  sqlState: '28000',
  sqlMessage: "Access denied for user 'user'@'172.24.0.1' (using password: YES)",
```

Then you probably still have an old docker volume created with another password:

```
$ docker volume ls
DRIVER    VOLUME NAME
local     test_db-volume
```

Remove it:

    docker-compose rm -vfs
    docker volume rm test_db-volume

Or remove everything:

    docker system prune --all --volumes


### Real Live Example

Let's implement [the MikroORM example from my Blog](https://marc.wäckerlin.ch/computer/nestjs-mikroorm): A databse with Author, Publisher and Book, where the Book refers to any number of Authors and Publishers, while there is no reference from Author or Publisher to the Book (unidirectional).

#### Setup Basics

```bash
nest new -c @mwaeckerlin/schematics -p npm test
cd test
nest g -c @mwaeckerlin/schematics db
nest g -c @mwaeckerlin/schematics res author
nest g -c @mwaeckerlin/schematics res punlisher
nest g -c @mwaeckerlin/schematics res book
```

#### Entities

First we define the entities (the database schema).

Please note that comments are automatically added to the return value description in the generated API documentation.

##### Author

Just add the properties:

```typescript
import { Entity, Property } from '@mikro-orm/core'
import { Base } from '../../base/entities/base.entity'
import { CreateAuthorDto } from '../dto/create-author.dto'

@Entity()
export class Author extends Base {
  constructor(createAuthorDto: CreateAuthorDto) {
    super()
    Object.assign(this, createAuthorDto)
  }

  /* author's first name(s) */
  @Property()
  first_names?: string[]

  /* author's family name(s) */
  @Property()
  last_names!: string[]

  /* date of birth of the author */
  @Property()
  born?: Date

  /* date of death of the author, if applicable */
  @Property()
  died?: Date
}
```

##### Publisher

Just add the properties:

```typescript
import { Entity, Property } from '@mikro-orm/core'
import { Base } from '../../base/entities/base.entity'
import { CreatePublisherDto } from '../dto/create-publisher.dto'

@Entity()
export class Publisher extends Base {
  constructor(createPublisherDto: CreatePublisherDto) {
    super()
    Object.assign(this, createPublisherDto)
  }

  /* name(s) of the publisher */
  @Property()
  publisher_names!: string[]

  /* full address of the publisher, may contain several lines */
  @Property()
  publisher_address_lines?: string[]

}
```

##### Book

The book is a little bit more complex, since it refers to Author and Publisher:

```typescript
import { Collection, Entity, ManyToMany, Property } from '@mikro-orm/core'
import { Author } from '../author/entities/author.entity'
import { Publisher } from '../publisher/entities/publisher.entity'
import { Base } from '../../base/entities/base.entity'
import { CreateBookDto } from '../dto/create-book.dto'

@Entity()
export class Book extends Base {
  constructor(createBookDto: CreateBookDto, authors?: Author[], publishers?: Publisher[]) {
    super()
    Object.assign(this, {...createBookDto, authors, publishers})
  }

  /* title(s) of the book */
  @Property()
  titles!: string[]

  /* full structure of the author(s) of the book */
  @ManyToMany()
  authors =  new Collection<Author>(this)

  /* full structure of the publisher(s) of the book */
  @ManyToMany()
  publishers = new Collection<Publisher>(this)

  /* ISBN is available */
  @Property()
  isbn?: string

}
```

#### Creation DTOs

The update DTOs are generic, but in the creation DTOs you need to set the values that will be passed thriough the REST API.

Please note that comments are automatically added to the interface description.

##### Author

```typescript
export class CreateAuthorDto {
  /* author's first name(s) */
  first_names?: string[]
  /* author's family name(s) */
  last_names!: string[]
  /* date of birth of the author */
  born?: Date
  /* date of death of the author, if applicable */
  died?: Date
}```

##### Publisher

```typescript
export class CreatePublisherDto {
  /* name(s) of the publisher */
  publisher_names?: string[]
  /* full address of the publisher, may contain several lines */
  publisher_address_lines?: string[]
}
```

##### Book

At creation, authors and publishers are referenced as ids.

```typescript
export class CreateBookDto {
  /* title(s) of the book */
  titles?: string[]
  /* database id(s) of the author(s) of the book */
  authors?: string[]
  /* database id(s) of the publisher(s) of the book */
  publishers?: string[]
  /* ISBN is available */
  isbn?: string
}
```

#### Book Service

Only the Book service needs changes because the Book needs to refer to Author and Publisher. All controlers and the services of Author and Publisher remain unchanged.

```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Book } from './entities/book.entity'
import { CreateBookDto } from './dto/create-book.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { EntityManager } from '@mikro-orm/core'
import { Publisher } from '../publisher/entities/publisher.entity'
import { Author } from '../author/entities/author.entity'

@Injectable()
export class BookService {
  private readonly logger = new Logger(this.constructor.name)
  constructor(private readonly em: EntityManager) { }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    return await this.em.transactional(async (em) => {
      const authors = await em.find(Author, { id: { $in: createBookDto.authors ?? [] } })
      if ((authors?.length ?? 0) !== (createBookDto?.authors?.length ?? 0)) throw new NotFoundException('author not found')
      const publishers = await em.find(Publisher, { id: { $in: createBookDto.publishers ?? [] } })
      if ((publishers?.length ?? 0) !== (createBookDto?.publishers?.length ?? 0)) throw new NotFoundException('publisher not found')
      const book = new Book(createBookDto, authors, publishers)
      await em.persistAndFlush(book)
      return book
    })
  }

  async findAll(query: Object = {}): Promise<Book[]> {
    return this.em.find(Book, query, { populate: ['authors', 'publishers'] })
  }

  async findOne(id: string): Promise<Book> {
    return this.em.findOneOrFail(Book, id, { populate: ['authors', 'publishers'] })
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    return await this.em.transactional(async (em) => {
      const authors = await em.find(Author, { id: { $in: updateBookDto.authors ?? [] } })
      if ((authors?.length ?? 0) !== (updateBookDto?.authors?.length ?? 0)) throw new NotFoundException('author not found')
      const publishers = await em.find(Publisher, { id: { $in: updateBookDto.publishers ?? [] } })
      if ((publishers?.length ?? 0) !== (updateBookDto?.publishers?.length ?? 0)) throw new NotFoundException('publisher not found')
      const book = await em.findOneOrFail(Book, { id })
      Object.assign(book, {
        ...updateBookDto,
        authors: updateBookDto.authors === null ? book.authors : authors,
        publishers: updateBookDto.publishers === null ? book.publishers : publishers
      })
      await em.persistAndFlush(book)
      return book
    })
  }

  async remove(id: string): Promise<Book> {
    const book = await this.em.findOneOrFail(Book, id)
    await this.em.removeAndFlush(book)
    return book
  }
}
```

#### Run

That's it, prepare it and generate the first migration:

    npm i
    npm run build
    npm run migration:initial

Start it:

    npm start

Then browse to [http://localhost:4000/api] and play with the API!


## Description

The Nest CLI is a command-line interface tool that helps you to initialize, develop, and maintain your Nest applications. It assists in multiple ways, including scaffolding the project, serving it in development mode, and building and bundling the application for production distribution. It embodies best-practice architectural patterns to encourage well-structured apps. Read more [here](https://docs.nestjs.com/cli/overview).

## Installation

```bash
$ npm install -g @mwaeckerlin/schematics
```

## Usage

To use `@mwaeckerlin/schematics`, you need to explicitly refere to it:

```bash
$ nest new -c @mwaeckerlin/schematics [options] [name]
```

Learn more in the [official documentation](https://docs.nestjs.com/).

## Stay in touch

- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).