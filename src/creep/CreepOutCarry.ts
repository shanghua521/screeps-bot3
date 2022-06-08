import { MyRoom } from "MyRoom";
import BaseCreep from "./BaseCreep";

export default class CreepOutCarry extends BaseCreep {
  private working: boolean
  private stateChange: boolean

  constructor(creep: Creep, public myRoom: MyRoom) {
    super(creep)
    this.working = this.memory.working
  }

  public source() {
    if (this.myRoom.name != this.toRoomName) {
      let roomPosition = new RoomPosition(25, 25, this.toRoomName)
      this.goTo(roomPosition)
      this.memory.standee = false
      return false
    }

    let containers = this.myRoom.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_CONTAINER
      }
    })
    if (containers.length > 0) {
      if (this.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.goTo(containers[0].pos)
        this.memory.standee = false
      } else {
        this.memory.standee = true
      }
      return this.store.getFreeCapacity() <= 0
    }
    return this.store.getFreeCapacity() <= 0
  }

  public target() {
    if (this.myRoom.name == this.toRoomName) {
      // 先修路
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

      // 再造路
      let roadConstructions = this.myRoom.find(FIND_CONSTRUCTION_SITES)
      if (roadConstructions.length > 0) {
        let construction = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
        if (this.build(construction) == ERR_NOT_IN_RANGE) {
          this.goTo(construction.pos)
          this.memory.standee = false
        } else {
          this.memory.standee = true
        }
        return this.store.getUsedCapacity(RESOURCE_ENERGY) <= 0
      }
    }
    if (this.myRoom.name != this.fromRoomName) {
      let roomPosition = new RoomPosition(25, 25, this.fromRoomName)
      this.goTo(roomPosition)
      this.memory.standee = false
      return this.store.getUsedCapacity(RESOURCE_ENERGY) <= 0
    }
    if (this.myRoom.storage) {
      if (this.transfer(this.myRoom.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.goTo(this.myRoom.storage.pos)
        this.memory.standee = false
        return this.store.getUsedCapacity(RESOURCE_ENERGY) <= 0
      } else {
        this.memory.standee = true
      }
    }
    let containers = this.myRoom.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_CONTAINER
      }
    })
    if (containers.length > 0) {
      if (this.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.goTo(containers[0].pos)
        this.memory.standee = false
        return this.store.getUsedCapacity(RESOURCE_ENERGY) <= 0
      } else {
        this.memory.standee = true
      }
    }

    return this.store.getUsedCapacity(RESOURCE_ENERGY) <= 0
  }

  public work() {
    // 工作前判断房间状态,是否有入侵者
    let toRoom = Memory.rooms[this.toRoomName]
    if (toRoom && toRoom.hasInvader && toRoom.invaderDealTime > Game.time) {
      // 有入侵者并且还没死，去撤离点
      let flag = Game.flags[`leave${this.toRoomName}`]
      if (!this.pos.isNearTo(flag)) {
        this.goTo(flag.pos)
        this.memory.standee = false
      } else {
        this.memory.standee = true
      }
      // 查询是否健康，不健康了就发送信息，让入侵者死后再派人
      if (!this.isHealthy() && !this.memory.hasSendRebirth) {
        this.sendRebirthInfo(toRoom.invaderDealTime)
      }
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
    }

    // 如果已经发送过死亡信息，并且身上没能量，自杀
    if (this.memory.hasSendRebirth && this.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
      this.suicide()
    }
  }
}
