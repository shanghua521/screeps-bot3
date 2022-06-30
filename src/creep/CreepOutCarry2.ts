import { MyRoom } from "MyRoom";
import BaseCreep from "./BaseCreep";

export default class CreepOutCarry extends BaseCreep {
  private working: boolean
  private stateChange: boolean

  private currentContainer: Id<StructureContainer>;

  constructor(creep: Creep, public myRoom: MyRoom) {
    super(creep)
    this.currentContainer = this.memory.currentContainer
    this.working = this.memory.working
  }

  public initContainer() {
    let toRoomName = this.toRoomName
    if (this.currentContainer) {
      return true
    }

    // 有视野
    if (Game.rooms[toRoomName]) {
      // 选择占用少的 container
      let memory = Game.rooms[toRoomName].memory
      let containerData = memory.containerData
      for (let containerId in containerData) {
        let oneContainerData = containerData[containerId]
        if (oneContainerData.outCarry.length != oneContainerData.num) {
          // push 前长度
          oneContainerData.outCarry.push(this.id)
          this.currentContainer = containerId as Id<StructureContainer>
          this.memory.currentContainer = this.currentContainer

          break
        }
      }
      return true
    }
    return false
  }

  public source() {
    // 生出来就会执行这个，先绑定目标 container
    // 查看目标房间视野
    let container = Game.getObjectById(this.currentContainer)
    if (container && this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.goTo(container.pos)
    }
    return this.store.getFreeCapacity() <= 0
  }

  public target() {
    // 去往 fromRoom 的时候顺便修路
    if (this.myRoom.name != this.fromRoomName) {
      // 查看脚下有没有路，有路就修路
      let structures = this.pos.lookFor(LOOK_STRUCTURES)
      let road: StructureRoad = null
      for (let struct of structures) {
        if (struct.structureType == STRUCTURE_ROAD) {
          road = struct as StructureRoad
          break
        }
      }
      if (road && road.hits < road.hitsMax) {
        this.repair(road)
        return this.store.getUsedCapacity(RESOURCE_ENERGY) <= 0
      }
      // 不用修路，找建筑工地，去建造
      let constructions = this.myRoom.find(FIND_MY_CONSTRUCTION_SITES);
      if (constructions.length > 0) {
        let construction = this.pos.findClosestByRange(constructions);
        if (this.build(construction) == ERR_NOT_IN_RANGE || this.isOnEdge()) {
          this.goTo(construction.pos)
          this.memory.standee = false
        } else {
          this.memory.standee = true
        }
        return this.store.getUsedCapacity(RESOURCE_ENERGY) <= 0
      }

      // 都没有
    }
    const fromRoom = Game.rooms[this.fromRoomName];
    // 到达出生地房间了
    const storage = fromRoom.storage
    if (storage && this.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.goTo(storage.pos)
    }
    return this.store.getUsedCapacity(RESOURCE_ENERGY) <= 0
  }

  public work() {
    // 工作前判断房间状态,是否有入侵者
    let toRoom = Memory.rooms[this.toRoomName]
    if (toRoom && toRoom.hasInvader && toRoom.invaderDealTime > Game.time) {
      // 有入侵者并且还没死，去撤离点
      let flag = Game.flags[`leave${this.toRoomName}`]
      if (flag && !this.pos.isNearTo(flag)) {
        this.goTo(flag.pos)
        this.memory.standee = false
      } else {
        this.memory.standee = true
      }
      // 查询是否健康，不健康了就发送信息，让入侵者死后再派人
      if ((!this.isHealthy() || this.hits != this.hitsMax) && !this.memory.hasSendRebirth) {
        this.sendRebirthInfo(toRoom.invaderDealTime)
      }
      return
    }
    // 如果收到伤害，说明有入侵者
    if (this.hits != this.hitsMax && !this.memory.hasSendRebirth) {
      // 发送重生消息，1500 tick 后再产生我
      this.sendRebirthInfo(Game.time + 1500)
    }
    if (!this.initContainer()) {
      return
    }
    // 如果正在工作
    if (this.working) {
      // 执行 target 代码逻辑
      if (this.target) this.stateChange = this.target()
    } else {
      // 执行 source 代码逻辑
      if (this.source) this.stateChange = this.source()
    }
    // 切换状态
    if (this.stateChange) this.memory.working = !this.memory.working

    // 查询是否健康，不健康了就发送信息，让派人过来
    if (!this.isHealthy() && !this.memory.hasSendRebirth) {
      this.sendRebirthInfo()
      if (this.currentContainer) {
        let memory = Memory.rooms[this.toRoomName]
        memory.containerData[this.currentContainer].outCarry = _.remove(memory.containerData[this.currentContainer].outCarry,(creep)=>creep = this.id)
      }
    }

    // 如果已经发送过死亡信息，并且身上没能量，自杀
    if (this.memory.hasSendRebirth && this.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
      this.suicide()
    }
  }
}
