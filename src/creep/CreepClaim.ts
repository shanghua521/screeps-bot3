import { MyRoom } from "MyRoom";
import BaseCreep from "./BaseCreep";

export default class CreepClaim extends BaseCreep {

  constructor(public creep: Creep, public myRoom?: MyRoom) {
    super(creep)
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
      if (!this.isHealthy(100) && !this.memory.hasSendRebirth) {
        this.sendRebirthInfo()
      }
      return
    }
    let roomName = this.toRoomName
    let roomPosition = new RoomPosition(25, 25, roomName)
    let room = Game.rooms[roomName]
    if (!room) {
      this.goTo(roomPosition)
    } else {
      if (this.reserveController(room.controller) == ERR_NOT_IN_RANGE) {
        this.goTo(room.controller.pos)
      }
    }

    if (!this.isHealthy(100) && !this.memory.hasSendRebirth) {
      this.sendRebirthInfo()
    }
  }
}
