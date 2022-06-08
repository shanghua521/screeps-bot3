import { MyRoom } from "MyRoom";
import BaseCreep from "./BaseCreep";

export default class CreepCarry extends BaseCreep {
  private working: boolean
  private stateChange: boolean

  constructor(creep: Creep, public myRoom: MyRoom) {
    super(creep)
    this.working = this.memory.working
  }

  public source() {
    // let tombstones = this.myRoom.find(FIND_TOMBSTONES)
    // if (tombstones.length > 0) {
    //   this.memory.collectRubbishMode = true
    //   let tombstone = this.pos.findClosestByRange(tombstones)
    //   if (this.withdraw(tombstone, RESOURCE_ENERGY) == ERR_NOT_OWNER) {
    //     this.goTo(tombstone.pos)
    //   }
    // } else {
    //   this.memory.collectRubbishMode = false
    // }

    let allSource = this.myRoom.allSource
    let source: any
    // 先去其他资源取，如果都没资源，去 storage 拿
    if (allSource.length > 0) {
      source = this.pos.findClosestByRange(allSource)
      if (source instanceof StructureContainer) {
        let surplusEnergy = source.store.getUsedCapacity(RESOURCE_ENERGY)
        if (surplusEnergy - this.store.getFreeCapacity() < 200) {
          _.remove(this.myRoom.allSource,_source => _source == source)
        }
      }
    } else {
      if (this.room.storage && this.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        source = this.room.storage
      }
    }
    if (source && this.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.goTo(source.pos)
      this.memory.standee = false
    } else {
      this.memory.standee = true
    }
    return this.store.getFreeCapacity() <= 0
  }

  public target() {
    let allTarget = this.myRoom.allTarget
    let target: any
    if (allTarget && allTarget.length != 0) {
      target = this.pos.findClosestByRange(allTarget)
    } else {
      if (this.myRoom.terminal && this.myRoom.terminal.store.getUsedCapacity(RESOURCE_ENERGY) <= 3000) {
        target = this.myRoom.terminal
      } else {
        if (this.myRoom.storage) {
          target = this.myRoom.storage
        }
      }
    }
    // if (this.memory.collectRubbishMode) {
    //   target = this.myRoom.storage
    // }
    if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.goTo(target.pos)
      this.memory.standee = false
    } else {
      this.memory.standee = true
    }
    // 自己身上的能量没有了，返回 true（切换至 source 阶段）
    return this.store[RESOURCE_ENERGY] <= 0
  }

  public work() {
    if (!this.isInRightRoom()) {
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
  }
}
