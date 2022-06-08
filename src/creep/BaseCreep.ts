export default class BaseCreep extends Creep implements CreepLifeCycle {
  public creep: Creep

  public fromRoomName: string
  public toRoomName: string
  public standee: boolean

  constructor(creep: Creep) {
    super(creep.id)
    this.fromRoomName = this.memory.fromRoom
    this.toRoomName = this.memory.toRoomName

    this.standee = this.memory.standee
  }

  public prepare() {
    return false
  }

  // 默认，永远执行 target
  public target() {
    return false
  }


  public source(): boolean {
    return false
  }

  public isHealthy(tickToDie?: number) {
    if(!this.ticksToLive)return true
    if (!tickToDie) tickToDie = 50
    return this.ticksToLive > tickToDie
  }

  public work() { }

  // 是否在自己应该在的房间
  public isInRightRoom() {
    let roomName = this.memory.targetRoomName
    if (!roomName) roomName = this.memory.toRoomName
    if (!roomName) return true
    // 备份一下，不过看着怪怪的
    if (!this.memory.toRoomName) {
      this.memory.toRoomName = roomName
    }
    this.toRoomName = this.memory.toRoomName
    // 如果 room 不可见
    if (this.room.name != roomName) {
      // 长途可以多加些缓存
      let roomPosition = new RoomPosition(25, 25, roomName)
      this.goTo(roomPosition)
      return false
    } else {
      // 到了就初始化并且删除 targetRoom,表示自己到房间了
      this.memory.targetRoomName = undefined
      return true
    }
  }

  public sendRebirthInfo(rebirthTime?:number) {
    // 需要先判断当前房间是否有生产我的条件，有 spawn
    let spawns = this.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })
    // 生成我就不能仅仅添加一个 role，还需要添加我的目标房间
    let reBirthInfo: {
      role: string
      targetRoomName?: string
      toRoomName?: string
      fromRoomName?: string
      // 重生时间
      rebirthTime?:number
    } = { role: this.memory.role }
    if (this.toRoomName) {
      reBirthInfo.targetRoomName = this.toRoomName
      reBirthInfo.toRoomName = this.toRoomName
    }
    if (rebirthTime) {
      reBirthInfo.rebirthTime = rebirthTime
    }
    if (spawns.length > 0) {
      this.room.memory.spawnList.push(reBirthInfo)
      console.log(`${this.name}要死了，发送重生信息到当前房间 ${this.room.name} 放入房间重生列表 ${this.room.memory.spawnList.length} end`)
    } else {
      // 让生成我的房间生我
      let fromRoom = Game.rooms[this.fromRoomName];
      fromRoom.memory.spawnList.push(reBirthInfo)
      console.log(`${this.name}要死了，当前房间 ${this.room.name} 发送重生信息到出生地房间 ${fromRoom.name} 放入房间重生列表 ${fromRoom.memory.spawnList.length} end`)
    }

    // 已经发送过死亡预告了
    this.memory.hasSendRebirth = true
  }

  // 带缓存的移动
  public goTo(target: RoomPosition, range: number = 1, ops?: number) {
    // 初始化路径信息
    if (this.memory.moveData == undefined) this.memory.moveData = {}
    // 序列化目标位置
    const targetPos = this.standardizePos(target)
    // 如果目标改变
    if (targetPos != this.memory.moveData.targetPos) {
      this.memory.moveData.targetPos = targetPos
      this.memory.moveData.path = this.findPath(target, range, ops);
    }
    // 如果缓存被清除
    if (!this.memory.moveData.path) {
      this.memory.moveData.path = this.findPath(target, range, ops);
    }
    // 还是空就是没找到路径
    if (!this.memory.moveData.path) {
      delete this.memory.moveData.path
      return ERR_NO_PATH
    }
    // 使用缓存移动
    const goResult = this.goByPath()
    if (goResult != OK && goResult != ERR_TIRED) {
      this.say(`异常码:${goResult}`)
    }
    return goResult
  }

  private goByPath() {
    if (!this.memory.moveData) return ERR_NO_PATH
    // 移动索引
    const index = this.memory.moveData.index
    // 到达目的地了
    if (index >= this.memory.moveData.path.length) {
      delete this.memory.moveData.path
      return OK
    }
    // 获取方向，进行移动
    const direction = <DirectionConstant>Number(this.memory.moveData.path[index])
    // console.log(this.name)
    // console.log(index)
    // console.log(direction)
    // console.log(this.memory.moveData.path)

    const goResult = this.go(direction)
    // console.log(goResult)
    if (goResult == OK) {
      this.memory.moveData.index++
    }
    return goResult
  }

  private go(direction: DirectionConstant) {
    const moveResult = this.move(direction)
    if (moveResult != OK) return moveResult

    // 如果 ok 有可能装上东西
    const currentPos = `${this.pos.x}/${this.pos.y}`
    // 撞墙了
    if (this.memory.prePos && currentPos == this.memory.prePos) {
      // 重新选路
      delete this.memory.moveData
      return ERR_INVALID_TARGET
    }
    this.memory.prePos = currentPos
    return OK
  }

  private findPath(target: RoomPosition, range: number, ops?: number): string {
    this.memory.moveData.index = 0
    if (!global.routeCache) global.routeCache = {}
    const routeKey = `${this.standardizePos(this.pos)} ${this.standardizePos(target)}`
    let route = global.routeCache[routeKey]

    // let mark = false
    // // 去除没有视野的房间
    // if (target.roomName != this.room.name) {
    //   let myRoomParsed = Number((/^[WE]([0-9]+)[NS]([0-9]+)$/.exec(this.room.name)));
    //   let disRoomParsed = Number((/^[WE]([0-9]+)[NS]([0-9]+)$/.exec(target.roomName)));
    //   // 勾股定理计算距离
    //   let enoughDistance = Math.sqrt(Math.abs(myRoomParsed[0] - disRoomParsed[0]) ** 2 + Math.abs(myRoomParsed[1] - disRoomParsed[1]) ** 2)
    //   if (enoughDistance > 4.3)

    // }

    const result = PathFinder.search(this.pos, { pos: target, range: range }, {
      // 平地 cost
      plainCost: 2,
      // 沼泽 cost
      swampCost: 30,
      // 当前房间 1.2 cpu，其他房间 8 cpu
      maxOps: ops ? ops : (target.roomName == this.room.name) ? 1200 : 8000,
      roomCallback: roomName => {

        const room = Game.rooms[roomName]
        // 没有视野的房间
        if (!room) return false
        // if (this.fromRoomName == this.toRoomName && room.name != this.fromRoomName) {
        //   return false
        // }
        // 有视野的房间
        let costs = new PathFinder.CostMatrix
        // 将道路 cost 设置为 1
        room.find(FIND_STRUCTURES).forEach(structure => {
          let structureType = structure.structureType
          if (structureType == STRUCTURE_ROAD) {
            costs.set(structure.pos.x, structure.pos.y, 1)
          } else if (structureType !== STRUCTURE_CONTAINER && structureType !== STRUCTURE_RAMPART) {
            costs.set(structure.pos.x, structure.pos.y, 255)
          }
        })
        room.find(FIND_STRUCTURES).forEach(structure => {
          let structureType = structure.structureType
          if (structureType == STRUCTURE_WALL) {
            costs.set(structure.pos.x, structure.pos.y, 255)
          }
        })
        room.find(FIND_HOSTILE_STRUCTURES).forEach(structure => {
          if (structure instanceof StructureRampart && structure.isPublic) {
            costs.set(structure.pos.x, structure.pos.y, 1)
          }
        })
        room.find(FIND_CONSTRUCTION_SITES).forEach(construction => {
          let structureType = construction.structureType
          if (structureType != STRUCTURE_RAMPART && structureType != STRUCTURE_ROAD && structureType != STRUCTURE_CONTAINER) {
            costs.set(construction.pos.x, construction.pos.y, 255)
          }
        })
        room.find(FIND_HOSTILE_CREEPS).forEach(creep => {
          costs.set(creep.pos.x, creep.pos.y, 255)
        })
        room.find(FIND_MY_CREEPS).forEach(creep => {
          if (creep.memory.standee || creep.memory.standee == undefined) {
            costs.set(creep.pos.x, creep.pos.y, 255)
          } else {
            costs.set(creep.pos.x, creep.pos.y, 3)
          }
        })
        return costs
      }
    })
    // 寻路异常
    if (result.path.length <= 0) return null
    // 寻路结果压缩
    route = this.serializeFarPath(result.path);

    if (!result.incomplete) global.routeCache[routeKey] = route
    return route
  }

  private serializeFarPath(path: RoomPosition[]): string {
    if (path.length == 0) return ''
    // 确保路径第一个位置是当前位置
    if (!path[0].isEqualTo(this.pos)) path.splice(0, 0, this.pos)

    return path.map((pos, index) => {
      // 最后一个位置不需要移动
      if (index >= path.length - 1) return null;
      if (pos.roomName != path[index + 1].roomName) return null
      return pos.getDirectionTo(path[index + 1])
    }).join('')
  }

  private standardizePos(pos: RoomPosition) {
    return `${pos.roomName}/${pos.x}/${pos.y}/${Game.shard.name}`
  }
}
