import { MyRoom } from "MyRoom";
import CreepHarvester from "./CreepHarvester";

// 去往其他房间的 harvester
export default class CreepOutHarvester extends CreepHarvester {
  constructor(creep: Creep, myRoom: MyRoom) {
    super(creep, myRoom);
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
      // 查询是否健康，不健康了就发送信息，让派人过来
      if (!this.isHealthy() && !this.memory.hasSendRebirth) {
        this.sendRebirthInfo()
        // 把自己从占用删掉
        let toRoomMemory = Memory.rooms[this.toRoomName]
        _.remove(toRoomMemory.structureIdData.harvesterData[this.currentSource.id].harvesters, (harvesterId) => harvesterId == this.id)
      }
      return
    }
    // 判断是否在我要工作的房间
    if (this.isInRightRoom()) {
      this.initSource()
    } else {
      // isInRightRoom 会自动往 目标房间前进
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
      // 把自己从占用删掉
      let toRoomMemory = Memory.rooms[this.toRoomName]
      _.remove(toRoomMemory.structureIdData.harvesterData[this.currentSource.id].harvesters, (harvesterId) => harvesterId == this.id)
    }
  }
}
