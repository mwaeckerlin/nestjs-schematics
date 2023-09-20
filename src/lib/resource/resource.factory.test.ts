import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing'
import * as path from 'path'
import { ResourceOptions } from './resource.schema'

describe('Resource Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  )

  describe('[REST API]', () => {
    it('should generate appropriate files ', async () => {
      const options: ResourceOptions = {
        name: 'users',
      }
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise()
      const files = tree.files
      expect(files).toEqual([
        '/users/users.controller.spec.ts',
        '/users/users.controller.ts',
        '/users/users.module.ts',
        '/users/users.service.spec.ts',
        '/users/users.service.ts',
        '/users/dto/create-user.dto.ts',
        '/users/dto/update-user.dto.ts',
        '/users/entities/user.entity.ts',
      ])
    })
    it("should keep underscores in resource's path and file name", async () => {
      const options: ResourceOptions = {
        name: '_users',
      }
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise()
      const files = tree.files
      expect(files).toEqual([
        '/_users/_users.controller.spec.ts',
        '/_users/_users.controller.ts',
        '/_users/_users.module.ts',
        '/_users/_users.service.spec.ts',
        '/_users/_users.service.ts',
        '/_users/dto/create-_user.dto.ts',
        '/_users/dto/update-_user.dto.ts',
        '/_users/entities/_user.entity.ts',
      ])
    })
    describe('when "crud" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          crud: false,
        }
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise()
        const files = tree.files
        expect(files).toEqual([
          '/users/users.controller.spec.ts',
          '/users/users.controller.ts',
          '/users/users.module.ts',
          '/users/users.service.spec.ts',
          '/users/users.service.ts',
        ])
      })
    })
    describe('when "spec" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          spec: false,
          crud: false,
        }
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise()
        const files = tree.files
        expect(files).toEqual([
          '/users/users.controller.ts',
          '/users/users.module.ts',
          '/users/users.service.ts',
        ])
      })
    })
  })

  describe('[REST API]', () => {
    const options: ResourceOptions = {
      name: 'users',
      isSwaggerInstalled: true,
    }

    let tree: UnitTestTree

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise()
    })

    it('should generate "UsersController" class', () => {
      expect(tree.readContent('/users/users.controller.ts'))
        .toEqual(`import { Controller, Get, Post, Body, Query, Patch, Param, Delete } from '@nestjs/common'
import {UsersService} from './users.service'
import {CreateUser} from './dto/create-user.dto'
import {UpdateUser} from './dto/update-user.dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUser: CreateUser) {
    return this.usersService.create(createUser)
  }

  @Get()
  findAll(@Query() query?: Record<string, any>) {
    return this.usersService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUser: UpdateUser) {
    return this.usersService.update(id, updateUser)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }
}
`)
    })

    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/core'
import { User } from './entities/user.entity'
import { CreateUser } from './dto/create-user.dto'
import { UpdateUser } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async create(createUser: CreateUser): Promise<User> {
    const newUser = new User(createUser)
    await this.em.persistAndFlush(newUser)
    return newUser
  }

  async findAll(query: Record<string, any> = {}): Promise<User[]> {
    return await this.em.find(User, query)
  }

  async findOne(id: string): Promise<User> {
    return this.em.findOneOrFail(User, id)
  }

  async update(id: string, updateUser: UpdateUser): Promise<User> {
    return await this.em.transactional(async (em) => {
      const user = await em.findOneOrFail(User, id)
      Object.assign(user, updateUser, { merge: true })
      await em.persistAndFlush(user)
      return user
    })
  }

  async remove(id: string): Promise<User> {
    const user = await this.em.findOneOrFail(User, id)
    await this.em.removeAndFlush(user)
    return user
  }
}
`)
    })

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'

@Module({
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
`)
    })

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts'))
        .toEqual(`import { Entity } from '@mikro-orm/core'
import { Base } from '../../base/entities/base.entity'
import { CreateUserDto } from '../dto/create-user.dto'

@Entity()
export class User extends Base {
  constructor(createUserDto: CreateUserDto) {
    super()
    Object.assign(this, createUserDto)
  }
}
`)
    })

    it('should generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/dto/create-user.dto.ts')).toEqual(
        `export class CreateUserDto {}
`,
      )
    })

    it('should generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/dto/update-user.dto.ts'))
        .toEqual(`import { PartialType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {}
`)
    })

    it('should generate "UsersController" spec file', () => {
      expect(tree.readContent('/users/users.controller.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

describe('UsersController', () => {
  let controller: UsersController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile()

    controller = module.get<UsersController>(UsersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
`)
    })

    it('should generate "UsersService" spec file', () => {
      expect(tree.readContent('/users/users.service.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
`)
    })
  })

  describe('[REST API - with "crud" disabled]', () => {
    const options: ResourceOptions = {
      name: 'users',
      crud: false,
      spec: false,
    }

    let tree: UnitTestTree

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise()
    })

    it('should generate "UsersController" class', () => {
      expect(tree.readContent('/users/users.controller.ts'))
        .toEqual(`import { Controller } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
`)
    })

    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common'

@Injectable()
export class UsersService {}
`)
    })

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'

@Module({
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
`)
    })

    it('should not generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts')).toEqual('')
    })

    it('should not generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/dto/create-user.dto.ts')).toEqual('')
    })

    it('should not generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/dto/update-user.dto.ts')).toEqual('')
    })
  })

  describe('[Microservice]', () => {
    it('should generate appropriate files ', async () => {
      const options: ResourceOptions = {
        name: 'users',
        type: 'microservice',
      }
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise()
      const files = tree.files
      expect(files).toEqual([
        '/users/users.controller.spec.ts',
        '/users/users.controller.ts',
        '/users/users.module.ts',
        '/users/users.service.spec.ts',
        '/users/users.service.ts',
        '/users/dto/create-user.dto.ts',
        '/users/dto/update-user.dto.ts',
        '/users/entities/user.entity.ts',
      ])
    })
    describe('when "crud" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          crud: false,
          type: 'microservice',
        }
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise()
        const files = tree.files
        expect(files).toEqual([
          '/users/users.controller.spec.ts',
          '/users/users.controller.ts',
          '/users/users.module.ts',
          '/users/users.service.spec.ts',
          '/users/users.service.ts',
        ])
      })
    })
    describe('when "spec" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          spec: false,
          crud: false,
          type: 'microservice',
        }
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise()
        const files = tree.files
        expect(files).toEqual([
          '/users/users.controller.ts',
          '/users/users.module.ts',
          '/users/users.service.ts',
        ])
      })
    })
  })

  describe('[Microservice]', () => {
    const options: ResourceOptions = {
      name: 'users',
      type: 'microservice',
    }

    let tree: UnitTestTree

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise()
    })

    it('should generate "UsersController" class', () => {
      expect(tree.readContent('/users/users.controller.ts'))
        .toEqual(`import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('createUser')
  create(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @MessagePattern('findAllUsers')
  findAll() {
    return this.usersService.findAll()
  }

  @MessagePattern('findOneUser')
  findOne(@Payload() id: string) {
    return this.usersService.findOne(id)
  }

  @MessagePattern('updateUser')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id, updateUserDto)
  }

  @MessagePattern('removeUser')
  remove(@Payload() id: string) {
    return this.usersService.remove(id)
  }
}
`)
    })

    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/core'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new User(createUserDto)
    await this.em.persistAndFlush(newUser)
    return newUser
  }

  async findAll(query: Record<string, any> = {}): Promise<User[]> {
    return await this.em.find(User, query)
  }

  async findOne(id: string): Promise<User> {
    return this.em.findOneOrFail(User, id)
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.em.transactional(async (em) => {
      const user = await em.findOneOrFail(User, id)
      Object.assign(user, updateUserDto, { merge: true })
      await em.persistAndFlush(user)
      return user
    })
  }

  async remove(id: string): Promise<User> {
    const user = await this.em.findOneOrFail(User, id)
    await this.em.removeAndFlush(user)
    return user
  }
}
`)
    })

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'

@Module({
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
`)
    })

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts'))
        .toEqual(`import { Entity } from '@mikro-orm/core'
import { Base } from '../../base/entities/base.entity'
import { CreateUserDto } from '../dto/create-user.dto'

@Entity()
export class User extends Base {
  constructor(createUserDto: CreateUserDto) {
    super()
    Object.assign(this, createUserDto)
  }
}
`)
    })

    it('should generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/dto/create-user.dto.ts')).toEqual(
        `export class CreateUserDto {}
`,
      )
    })

    it('should generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/dto/update-user.dto.ts'))
        .toEqual(`import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  id: string
}
`)
    })

    it('should generate "UsersController" spec file', () => {
      expect(tree.readContent('/users/users.controller.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

describe('UsersController', () => {
  let controller: UsersController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile()

    controller = module.get<UsersController>(UsersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
`)
    })

    it('should generate "UsersService" spec file', () => {
      expect(tree.readContent('/users/users.service.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
`)
    })
  })

  describe('[Microservice - with "crud" disabled]', () => {
    const options: ResourceOptions = {
      name: 'users',
      type: 'microservice',
      crud: false,
      spec: false,
    }

    let tree: UnitTestTree

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise()
    })

    it('should generate "UsersController" class', () => {
      expect(tree.readContent('/users/users.controller.ts'))
        .toEqual(`import { Controller } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
`)
    })

    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common'

@Injectable()
export class UsersService {}
`)
    })

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'

@Module({
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
`)
    })

    it('should not generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts')).toEqual('')
    })

    it('should not generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/dto/create-user.dto.ts')).toEqual('')
    })

    it('should not generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/dto/update-user.dto.ts')).toEqual('')
    })
  })

  describe('[WebSockets]', () => {
    it('should generate appropriate files ', async () => {
      const options: ResourceOptions = {
        name: 'users',
        type: 'ws',
      }
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise()
      const files = tree.files
      expect(files).toEqual([
        '/users/users.gateway.spec.ts',
        '/users/users.gateway.ts',
        '/users/users.module.ts',
        '/users/users.service.spec.ts',
        '/users/users.service.ts',
        '/users/dto/create-user.dto.ts',
        '/users/dto/update-user.dto.ts',
        '/users/entities/user.entity.ts',
      ])
    })
    describe('when "crud" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          crud: false,
          type: 'ws',
        }
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise()
        const files = tree.files
        expect(files).toEqual([
          '/users/users.gateway.spec.ts',
          '/users/users.gateway.ts',
          '/users/users.module.ts',
          '/users/users.service.spec.ts',
          '/users/users.service.ts',
        ])
      })
    })
    describe('when "spec" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          spec: false,
          crud: false,
          type: 'ws',
        }
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise()
        const files = tree.files
        expect(files).toEqual([
          '/users/users.gateway.ts',
          '/users/users.module.ts',
          '/users/users.service.ts',
        ])
      })
    })
  })

  describe('[WebSockets]', () => {
    const options: ResourceOptions = {
      name: 'users',
      crud: true,
      type: 'ws',
    }

    let tree: UnitTestTree

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise()
    })

    it('should generate "UsersGateway" class', () => {
      expect(tree.readContent('/users/users.gateway.ts'))
        .toEqual(`import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@WebSocketGateway()
export class UsersGateway {
  constructor(private readonly usersService: UsersService) {}

  @SubscribeMessage('createUser')
  create(@MessageBody() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @SubscribeMessage('findAllUsers')
  findAll() {
    return this.usersService.findAll()
  }

  @SubscribeMessage('findOneUser')
  findOne(@MessageBody() id: string) {
    return this.usersService.findOne(id)
  }

  @SubscribeMessage('updateUser')
  update(@MessageBody() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id, updateUserDto)
  }

  @SubscribeMessage('removeUser')
  remove(@MessageBody() id: string) {
    return this.usersService.remove(id)
  }
}
`)
    })
    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/core'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new User(createUserDto)
    await this.em.persistAndFlush(newUser)
    return newUser
  }

  async findAll(query: Record<string, any> = {}): Promise<User[]> {
    return await this.em.find(User, query)
  }

  async findOne(id: string): Promise<User> {
    return this.em.findOneOrFail(User, id)
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.em.transactional(async (em) => {
      const user = await em.findOneOrFail(User, id)
      Object.assign(user, updateUserDto, { merge: true })
      await em.persistAndFlush(user)
      return user
    })
  }

  async remove(id: string): Promise<User> {
    const user = await this.em.findOneOrFail(User, id)
    await this.em.removeAndFlush(user)
    return user
  }
}
`)
    })

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersGateway } from './users.gateway'

@Module({
  providers: [UsersGateway, UsersService]
})
export class UsersModule {}
`)
    })

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts'))
        .toEqual(`import { Entity } from '@mikro-orm/core'
import { Base } from '../../base/entities/base.entity'
import { CreateUserDto } from '../dto/create-user.dto'

@Entity()
export class User extends Base {
  constructor(createUserDto: CreateUserDto) {
    super()
    Object.assign(this, createUserDto)
  }
}
`)
    })

    it('should generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/dto/create-user.dto.ts')).toEqual(
        `export class CreateUserDto {}
`,
      )
    })

    it('should generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/dto/update-user.dto.ts'))
        .toEqual(`import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  id: string
}
`)
    })

    it('should generate "UsersGateway" spec file', () => {
      expect(tree.readContent('/users/users.gateway.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing'
import { UsersGateway } from './users.gateway'
import { UsersService } from './users.service'

describe('UsersGateway', () => {
  let gateway: UsersGateway

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersGateway, UsersService],
    }).compile()

    gateway = module.get<UsersGateway>(UsersGateway)
  })

  it('should be defined', () => {
    expect(gateway).toBeDefined()
  })
})
`)
    })

    it('should generate "UsersService" spec file', () => {
      expect(tree.readContent('/users/users.service.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
`)
    })
  })

  describe('[WebSockets - with "crud" disabled]', () => {
    const options: ResourceOptions = {
      name: 'users',
      crud: false,
      spec: false,
      type: 'ws',
    }

    let tree: UnitTestTree

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise()
    })

    it('should generate "UsersGateway" class', () => {
      expect(tree.readContent('/users/users.gateway.ts'))
        .toEqual(`import { WebSocketGateway } from '@nestjs/websockets'
import { UsersService } from './users.service'

@WebSocketGateway()
export class UsersGateway {
  constructor(private readonly usersService: UsersService) {}
}
`)
    })
    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common'

@Injectable()
export class UsersService {}
`)
    })

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersGateway } from './users.gateway'

@Module({
  providers: [UsersGateway, UsersService]
})
export class UsersModule {}
`)
    })

    it('should not generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts')).toEqual('')
    })

    it('should not generate "CreateUserDto" class', () => {
      expect(tree.readContent('/users/dto/create-user.dto.ts')).toEqual('')
    })

    it('should not generate "UpdateUserDto" class', () => {
      expect(tree.readContent('/users/dto/update-user.dto.ts')).toEqual('')
    })
  })

  describe('[GraphQL - Code first]', () => {
    it('should generate appropriate files ', async () => {
      const options: ResourceOptions = {
        name: 'users',
        crud: true,
        type: 'graphql-code-first',
      }
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise()
      const files = tree.files
      expect(files).toEqual([
        '/users/users.module.ts',
        '/users/users.resolver.spec.ts',
        '/users/users.resolver.ts',
        '/users/users.service.spec.ts',
        '/users/users.service.ts',
        '/users/dto/create-user.input.ts',
        '/users/dto/update-user.input.ts',
        '/users/entities/user.entity.ts',
      ])
    })
    describe('when "crud" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          crud: false,
          type: 'graphql-code-first',
        }
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise()
        const files = tree.files
        expect(files).toEqual([
          '/users/users.module.ts',
          '/users/users.resolver.spec.ts',
          '/users/users.resolver.ts',
          '/users/users.service.spec.ts',
          '/users/users.service.ts',
        ])
      })
    })
    describe('when "spec" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          spec: false,
          crud: false,
          type: 'graphql-code-first',
        }
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise()
        const files = tree.files
        expect(files).toEqual([
          '/users/users.module.ts',
          '/users/users.resolver.ts',
          '/users/users.service.ts',
        ])
      })
    })
  })
  describe('[GraphQL - Code first]', () => {
    const options: ResourceOptions = {
      name: 'users',
      crud: true,
      type: 'graphql-code-first',
    }

    let tree: UnitTestTree

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise()
    })

    it('should generate "UsersResolver" class', () => {
      expect(tree.readContent('/users/users.resolver.ts'))
        .toEqual(`import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { UsersService } from './users.service'
import { User } from './entities/user.entity'
import { CreateUserInput } from './dto/create-user.input'
import { UpdateUserInput } from './dto/update-user.input'

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput)
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll()
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: string) {
    return this.usersService.findOne(id)
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput)
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: string) {
    return this.usersService.remove(id)
  }
}
`)
    })
    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/core'
import { User } from './entities/user.entity'
import { CreateUserInput } from './dto/create-user.input'
import { UpdateUserInput } from './dto/update-user.input'

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const newUser = new User(createUserInput)
    await this.em.persistAndFlush(newUser)
    return newUser
  }

  async findAll(query: Record<string, any> = {}): Promise<User[]> {
    return await this.em.find(User, query)
  }

  async findOne(id: string): Promise<User> {
    return this.em.findOneOrFail(User, id)
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    return await this.em.transactional(async (em) => {
      const user = await em.findOneOrFail(User, id)
      Object.assign(user, updateUserInput, { merge: true })
      await em.persistAndFlush(user)
      return user
    })
  }

  async remove(id: string): Promise<User> {
    const user = await this.em.findOneOrFail(User, id)
    await this.em.removeAndFlush(user)
    return user
  }
}
`)
    })

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersResolver } from './users.resolver'

@Module({
  providers: [UsersResolver, UsersService]
})
export class UsersModule {}
`)
    })

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts'))
        .toEqual(`import { ObjectType, Field, Int } from '@nestjs/graphql'

@ObjectType()
export class User {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
`)
    })

    it('should generate "CreateUserInput" class', () => {
      expect(tree.readContent('/users/dto/create-user.input.ts')).toEqual(
        `import { InputType, Int, Field } from '@nestjs/graphql'

@InputType()
export class CreateUserInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
`,
      )
    })

    it('should generate "UpdateUserInput" class', () => {
      expect(tree.readContent('/users/dto/update-user.input.ts'))
        .toEqual(`import { CreateUserInput } from './create-user.input'
import { InputType, Field, Int, PartialType } from '@nestjs/graphql'

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => Int)
  id: string
}
`)
    })

    it('should generate "UsersResolver" spec file', () => {
      expect(tree.readContent('/users/users.resolver.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing'
import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'

describe('UsersResolver', () => {
  let resolver: UsersResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersResolver, UsersService],
    }).compile()

    resolver = module.get<UsersResolver>(UsersResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
`)
    })

    it('should generate "UsersService" spec file', () => {
      expect(tree.readContent('/users/users.service.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
`)
    })
  })

  describe('[GraphQL - Schema first]', () => {
    it('should generate appropriate files ', async () => {
      const options: ResourceOptions = {
        name: 'users',
        type: 'graphql-schema-first',
      }
      const tree = await runner
        .runSchematicAsync('resource', options)
        .toPromise()
      const files = tree.files
      expect(files).toEqual([
        '/users/users.graphql',
        '/users/users.module.ts',
        '/users/users.resolver.spec.ts',
        '/users/users.resolver.ts',
        '/users/users.service.spec.ts',
        '/users/users.service.ts',
        '/users/dto/create-user.input.ts',
        '/users/dto/update-user.input.ts',
        '/users/entities/user.entity.ts',
      ])
    })
    describe('when "crud" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          crud: false,
          type: 'graphql-schema-first',
        }
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise()
        const files = tree.files
        expect(files).toEqual([
          '/users/users.module.ts',
          '/users/users.resolver.spec.ts',
          '/users/users.resolver.ts',
          '/users/users.service.spec.ts',
          '/users/users.service.ts',
        ])
      })
    })
    describe('when "spec" option is not enabled', () => {
      it('should generate appropriate files (without dtos)', async () => {
        const options: ResourceOptions = {
          name: 'users',
          spec: false,
          crud: false,
          type: 'graphql-schema-first',
        }
        const tree = await runner
          .runSchematicAsync('resource', options)
          .toPromise()
        const files = tree.files
        expect(files).toEqual([
          '/users/users.module.ts',
          '/users/users.resolver.ts',
          '/users/users.service.ts',
        ])
      })
    })
  })
  describe('[GraphQL - Schema first]', () => {
    const options: ResourceOptions = {
      name: 'users',
      type: 'graphql-schema-first',
    }

    let tree: UnitTestTree

    beforeAll(async () => {
      tree = await runner.runSchematicAsync('resource', options).toPromise()
    })

    it('should generate "UsersResolver" class', () => {
      expect(tree.readContent('/users/users.resolver.ts'))
        .toEqual(`import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UsersService } from './users.service'
import { CreateUserInput } from './dto/create-user.input'
import { UpdateUserInput } from './dto/update-user.input'

@Resolver('User')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation('createUser')
  create(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput)
  }

  @Query('users')
  findAll() {
    return this.usersService.findAll()
  }

  @Query('user')
  findOne(@Args('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Mutation('updateUser')
  update(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput)
  }

  @Mutation('removeUser')
  remove(@Args('id') id: string) {
    return this.usersService.remove(id)
  }
}
`)
    })
    it('should generate "UsersService" class', () => {
      expect(tree.readContent('/users/users.service.ts'))
        .toEqual(`import { Injectable } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/core'
import { User } from './entities/user.entity'
import { CreateUserInput } from './dto/create-user.input'
import { UpdateUserInput } from './dto/update-user.input'

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const newUser = new User(createUserInput)
    await this.em.persistAndFlush(newUser)
    return newUser
  }

  async findAll(query: Record<string, any> = {}): Promise<User[]> {
    return await this.em.find(User, query)
  }

  async findOne(id: string): Promise<User> {
    return this.em.findOneOrFail(User, id)
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    return await this.em.transactional(async (em) => {
      const user = await em.findOneOrFail(User, id)
      Object.assign(user, updateUserInput, { merge: true })
      await em.persistAndFlush(user)
      return user
    })
  }

  async remove(id: string): Promise<User> {
    const user = await this.em.findOneOrFail(User, id)
    await this.em.removeAndFlush(user)
    return user
  }
}
`)
    })

    it('should generate "UsersModule" class', () => {
      expect(tree.readContent('/users/users.module.ts'))
        .toEqual(`import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersResolver } from './users.resolver'

@Module({
  providers: [UsersResolver, UsersService]
})
export class UsersModule {}
`)
    })

    it('should generate "User" class', () => {
      expect(tree.readContent('/users/entities/user.entity.ts'))
        .toEqual(`import { Entity } from '@mikro-orm/core'
import { Base } from '../../base/entities/base.entity'
import { CreateUserDto } from '../dto/create-user.dto'

@Entity()
export class User extends Base {
  constructor(createUserDto: CreateUserDto) {
    super()
    Object.assign(this, createUserDto)
  }
}
`)
    })

    it('should generate "CreateUserInput" class', () => {
      expect(tree.readContent('/users/dto/create-user.input.ts')).toEqual(
        `export class CreateUserInput {}
`,
      )
    })

    it('should generate "UpdateUserInput" class', () => {
      expect(tree.readContent('/users/dto/update-user.input.ts'))
        .toEqual(`import { CreateUserInput } from './create-user.input'
import { PartialType } from '@nestjs/mapped-types'

export class UpdateUserInput extends PartialType(CreateUserInput) {
  id: string
}
`)
    })

    it('should generate "UsersResolver" spec file', () => {
      expect(tree.readContent('/users/users.resolver.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing'
import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'

describe('UsersResolver', () => {
  let resolver: UsersResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersResolver, UsersService],
    }).compile()

    resolver = module.get<UsersResolver>(UsersResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
`)
    })

    it('should generate "UsersService" spec file', () => {
      expect(tree.readContent('/users/users.service.spec.ts'))
        .toEqual(`import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
`)
    })

    it('should generate "Users" GraphQL file', () => {
      expect(tree.readContent('/users/users.graphql')).toEqual(`type User {
  # Example field (placeholder)
  exampleField: Int
}

input CreateUserInput {
  # Example field (placeholder)
  exampleField: Int
}

input UpdateUserInput {
  id: Int!
}

type Query {
  users: [User]!
  user(id: Int!): User
}

type Mutation {
  createUser(createUserInput: CreateUserInput!): User!
  updateUser(updateUserInput: UpdateUserInput!): User!
  removeUser(id: Int!): User
}
`)
    })
  })
  it('should create spec files', async () => {
    const options: ResourceOptions = {
      name: 'foo',
      spec: true,
      flat: true,
    }
    const tree: UnitTestTree = await runner
      .runSchematicAsync('resource', options)
      .toPromise()
    const files: string[] = tree.files

    expect(
      files.find((filename) => filename === '/foo.controller.spec.ts'),
    ).toBeDefined()
    expect(
      files.find((filename) => filename === '/foo.service.spec.ts'),
    ).toBeDefined()
  })
  it('should create spec files with custom file suffix', async () => {
    const options: ResourceOptions = {
      name: 'foo',
      spec: true,
      specFileSuffix: 'test',
      flat: true,
    }
    const tree: UnitTestTree = await runner
      .runSchematicAsync('resource', options)
      .toPromise()
    const files: string[] = tree.files

    expect(
      files.find((filename) => filename === '/foo.controller.spec.ts'),
    ).toBeUndefined()
    expect(
      files.find((filename) => filename === '/foo.controller.test.ts'),
    ).toBeDefined()

    expect(
      files.find((filename) => filename === '/foo.service.spec.ts'),
    ).toBeUndefined()
    expect(
      files.find((filename) => filename === '/foo.service.test.ts'),
    ).toBeDefined()
  })
})
