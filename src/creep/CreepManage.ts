import { MyRoom } from "MyRoom";
import BaseCreep from "./BaseCreep";

export default class CreepManage extends BaseCreep {
  private working: boolean
  private stateChange: boolean

  constructor(creep: Creep, public myRoom: MyRoom) {
    super(creep)
    this.working = this.memory.working
  }

  public source() {
    let storage = this.myRoom.storage;
    if (this.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.goTo(storage.pos)
    }
    return this.store.getFreeCapacity() <= 0
  }

  public target() {
    let allTarget = this.myRoom.allTarget
    let target: any
    if (allTarget && allTarget.length != 0) {
      target = this.pos.findClosestByRange(allTarget)
    } else {
      if (this.myRoom.storage && this.myRoom.storage.store.getFreeCapacity(RESOURCE_ENERGY) >= 500000) {
        target = this.myRoom.storage
      } else if (this.myRoom.terminal && this.myRoom.terminal.store.getUsedCapacity() <= 10000) {
        target = this.myRoom.terminal
      } else if (this.myRoom.factory && this.myRoom.factory.store.getFreeCapacity(RESOURCE_ENERGY) >= 20000) {
        target = this.myRoom.factory
      }
    }
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
