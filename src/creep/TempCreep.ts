import { MyRoom } from "MyRoom";
import BaseCreep from "./BaseCreep"

export default class TempCreep extends BaseCreep{
  private stateChange: boolean
  private working: boolean

  constructor(public creep: Creep, public myRoom?: MyRoom) {
    super(creep)

    // 获取工作状态
    this.working = creep.memory.working
  }

  public source() {
    let storage = this.myRoom.storage;
    if (storage && this.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.goTo(storage.pos)
    }
    return this.store.getFreeCapacity() <= 0
  }

  public target() {
    let terminal = this.myRoom.terminal;
    if (terminal && this.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.goTo(terminal.pos)
    }
    return this.store[RESOURCE_ENERGY] <= 0
  }



  public work() {
    if (this.working) {
      // 执行 target 代码逻辑
      if (this.target) this.stateChange = this.target()
    } else {
      // 执行 source 代码逻辑
      if (this.source) this.stateChange = this.source()
    }
    // 切换状态
    if (this.stateChange) this.memory.working = !this.memory.working
  }
}
