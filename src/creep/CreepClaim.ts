import { MyRoom } from "MyRoom";
import BaseCreep from "./BaseCreep";

export default class CreepClaim extends BaseCreep {
  private working: boolean;
  private stateChange: boolean

  constructor(public creep: Creep, public myRoom?: MyRoom) {
    super(creep)
    this.working = this.memory.working
  }

  public source(): boolean {
    let toRoomName = this.toRoomName
    let claimFlag = Game.flags[`claim${toRoomName}`];
    if (!claimFlag) {
      return true
    }
    if (!this.pos.isNearTo(claimFlag.pos)) {
      this.goTo(claimFlag.pos)
      return false
    }
    return true
  }

  public target() {
    let roomName = this.toRoomName
    let roomPosition = new RoomPosition(25, 25, roomName)
    let room = Game.rooms[roomName]
    if (!room) {
      this.goTo(roomPosition)
    } else {
      if ((room.controller.owner != null && room.controller.owner.username != 'shanghua') || (room.controller.reservation && room.controller.reservation.username != 'shanghua')) {
        if (this.attackController(room.controller) == ERR_NOT_IN_RANGE) {
          this.goTo(room.controller.pos, 0)
        }
      } else {
        if (this.reserveController(room.controller) == ERR_NOT_IN_RANGE) {
          this.goTo(room.controller.pos, 0)
        }
      }
    }
    return false
  }

  public work() {
    // 工作前判断房间状态,是否有入侵者
    let toRoom = Memory.rooms[this.toRoomName]

    if (this.hitsMax != this.hits && !this.memory.hasSendRebirth) {
      this.sendRebirthInfo(Game.time + 1500)
    }

    // 撤离个屁，入侵者死了，你也死了
    // if (toRoom && toRoom.hasInvader && toRoom.invaderDealTime > Game.time) {
    //   // 有入侵者并且还没死，去撤离点
    //   let flag = Game.flags[`leave${this.toRoomName}`]
    //   if (!this.pos.isNearTo(flag)) {
    //     this.goTo(flag.pos)
    //     this.memory.standee = false
    //   } else {
    //     this.memory.standee = true
    //   }
    //   if (!this.memory.hasSendRebirth) {
    //     this.sendRebirthInfo(toRoom.invaderDealTime)
    //   }
    //   return
    // }

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
