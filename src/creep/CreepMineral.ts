import { MyRoom } from "MyRoom";
import _ from "lodash"
import BaseCreep from "./BaseCreep"

export default class CreepMineral extends BaseCreep {

  private working: boolean
  private stateChange = true

  private currentExtractor: StructureExtractor
  private currentMineral: Mineral
  private currentMineralContainer: StructureContainer

  private mineralType: MineralConstant

  constructor(public creep: Creep, public myRoom?: MyRoom) {
    super(creep)
    this.toRoomName = this.memory.toRoomName
    this.currentMineral = myRoom.mineral
    this.currentMineralContainer = myRoom.mineralContainer
    this.currentExtractor = myRoom.extractor

    this.mineralType = myRoom.mineral.mineralType
    // 获取工作状态
    this.working = creep.memory.working
  }

  public source(): boolean {
    let workCount = this.body.filter((part) => part.type == WORK).length
    if (this.currentExtractor.cooldown != 0) {
      if (this.withdraw(this.currentMineralContainer, this.mineralType) == ERR_NOT_IN_RANGE) {
        this.goTo(this.currentMineralContainer.pos)
        this.memory.standee = false
      } else {
        this.memory.standee = true
      }
      return this.store.getFreeCapacity(this.mineralType) < workCount
    }
    if (this.currentExtractor.cooldown == 0 && this.harvest(this.currentMineral) == ERR_NOT_IN_RANGE) {
      this.goTo(this.currentMineral.pos)
    }
    // let storage = this.myRoom.storage
    // if (this.withdraw(this.currentMineralContainer, RESOURCE_HYDROGEN) == ERR_NOT_IN_RANGE) {
    //     this.goTo(this.currentMineralContainer.pos)
    //   }
    return this.store.getFreeCapacity(this.mineralType) < workCount
  }

  public target(): boolean {
    if (this.myRoom.terminal) {
      if (this.transfer(this.myRoom.terminal, this.mineralType) == ERR_NOT_IN_RANGE) {
        this.goTo(this.myRoom.terminal.pos)
      }
      return this.store[this.mineralType] <= 0
    }
    if (this.myRoom.storage) {
      if (this.transfer(this.myRoom.storage, this.mineralType) == ERR_NOT_IN_RANGE) {
        this.goTo(this.myRoom.storage.pos)
      }
      return this.store[this.mineralType] <= 0
    }
    if (this.currentMineralContainer) {
      // 填充能量
      if (this.transfer(this.currentMineralContainer, this.mineralType) == ERR_NOT_IN_RANGE) {
        this.goTo(this.currentMineralContainer.pos)
      }
      return this.store[this.mineralType] <= 0
    }
    // 自己身上没有资源了
    return this.store[this.mineralType] <= 0
  }

  public work() {
    // 判断是否在我要工作的房间
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
