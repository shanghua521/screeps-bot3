import { MyRoom } from "MyRoom";
import _ from "lodash"
import BaseCreep from "./BaseCreep"

export default class CreepHeal extends BaseCreep {

  private working: boolean
  private stateChange = true

  constructor(public creep: Creep, public myRoom?: MyRoom) {
    super(creep)
    // 获取工作状态
    this.working = creep.memory.working
  }

  public source(): boolean {
    // 去往 flag 点
    let flag = Game.flags['heal']
    if (flag && !this.pos.isEqualTo(flag.pos)) {
      this.moveTo(flag.pos)
      return false
    } else {
      return true
    }
  }

  public target(): boolean {
    // 找到最近的 creep 治疗
    let toughCreep = this.pos.findInRange(FIND_CREEPS, 2, { filter: (creep) => creep.hits != creep.hitsMax })
    if (toughCreep.length <= 0) {
      return true
    }
    if (this.heal(toughCreep[0]) == ERR_NOT_IN_RANGE) {
      this.goTo(toughCreep[0].pos)
    }
    // 自己身上没有资源了
    return false
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
