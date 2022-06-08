import { MyRoom } from "MyRoom";
import BaseCreep from "./BaseCreep";

export default class CreepOutDefend extends BaseCreep {
  private working: boolean
  private stateChange: boolean

  constructor(creep: Creep, public myRoom: MyRoom) {
    super(creep)
    this.working = this.memory.working
  }

  public source() {
    return true;
  }

  public target() {
    var hostiles = this.myRoom.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
      let hostile = hostiles[0]
      if (this.rangedAttack(hostile) == ERR_NOT_IN_RANGE) this.moveTo(hostile)
      return false
    }
    if (this.hits < this.hitsMax) {
      this.heal(this)
    }
    let creeps = this.myRoom.find(FIND_MY_CREEPS, { filter: (creep) => creep.hits < creep.hitsMax })
    if (creeps.length > 0) {
      let creep = this.pos.findClosestByRange(creeps)
      if (this.heal(creep) == ERR_NOT_IN_RANGE) {
        this.goTo(creep.pos)
      }
      return false
    }
    this.goTo(new RoomPosition(25, 25, this.toRoomName))
    return false
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
    if (!this.isHealthy(100) && !this.memory.hasSendRebirth) {
      this.sendRebirthInfo()
    }
  }
}
