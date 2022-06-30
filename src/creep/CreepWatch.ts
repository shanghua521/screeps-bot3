import { MyRoom } from "MyRoom";
import BaseCreep from "./BaseCreep";

export default class CreepWatch extends BaseCreep {
  private working: boolean;
  private stateChange: boolean

  constructor(public creep: Creep, public myRoom?: MyRoom) {
    super(creep)
    this.working = this.memory.working
  }

  public source(): boolean {
    return true
  }

  public target() {
    let roomName = this.toRoomName
    let roomPosition = new RoomPosition(25, 25, roomName)
    let room = Game.rooms[roomName]
    if (!room) {
      this.goTo(roomPosition)
    } else {
      if (!this.pos.isNearTo(room.controller)) {
        this.goTo(room.controller.pos)
      }
    }
    return false
  }

  public work() {
    if (this.hitsMax != this.hits && !this.memory.hasSendRebirth) {
      this.sendRebirthInfo(Game.time + 500)
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

    if (!this.isHealthy(100) && !this.memory.hasSendRebirth) {
      this.sendRebirthInfo()
    }
  }
}
