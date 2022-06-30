import { MyRoom } from "MyRoom";
import _ from "lodash"
import BaseCreep from "./BaseCreep"

export default class CreepSeesaw extends BaseCreep {

  private working: boolean
  private stateChange = true

  constructor(public creep: Creep, public myRoom?: MyRoom) {
    super(creep)
    // 获取工作状态
    this.working = creep.memory.working
  }

  public source(): boolean {
    // 如果在 flag 旁边，血量没满，加血
    if (this.hits != this.hitsMax) {
      this.heal(this)
      // 去往 flag 点
      let flag = Game.flags['seesaw']
      if (flag && !this.pos.isNearTo(flag.pos)) {
        this.goTo(flag.pos)
      }
      return false
    }
    return true
  }

  public target(): boolean {
    if (this.myRoom.name != this.toRoomName) {
        let roomPosition = new RoomPosition(25, 25, this.toRoomName)
        this.goTo(roomPosition)
        return false
    }
    if (this.hits != this.hitsMax) {
      this.heal(this)
      // 去往 flag 点
      let flag = Game.flags['seesaw']
      if (flag && !this.pos.isNearTo(flag.pos)) {
        this.goTo(flag.pos)
      }
    }
    return true
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
