import { MyRoom } from "MyRoom";
import BaseCreep from "./BaseCreep";

export default class CreepBuilder extends BaseCreep {
  private working: boolean
  private stateChange: boolean

  // 要修的建筑
  private fixTarget: AnyStructure

  // 要修的建筑的目标 hits
  private fixTargetHits: number

  private currentConstructionSite: ConstructionSite

  constructor(creep: Creep, public myRoom: MyRoom) {
    super(creep)
    this.working = this.memory.working
    if (this.memory.currentConstructionSite) {
      this.currentConstructionSite = Game.getObjectById(this.memory.currentConstructionSite)
    }
    if (this.memory.fixTargetId) {
      this.fixTarget = Game.getObjectById(this.memory.fixTargetId)
      this.fixTargetHits = this.memory.fixTargetHits
    }
  }

  public source() {
    let resources = this.myRoom.find(FIND_DROPPED_RESOURCES)
    if (resources.length > 0 && resources[0].resourceType == RESOURCE_ENERGY) {
      if (this.pickup(resources[0]) == ERR_NOT_IN_RANGE) {
        this.goTo(resources[0].pos)
      }
      return this.store.getFreeCapacity() <= 0
    }

    let allSource = this.myRoom.allSource
    let source: any
    // 先去其他资源取，如果都没资源，去 storage 拿
    if (allSource.length > 0) {
      source = this.pos.findClosestByPath(allSource)
    } else {
      if (this.room.storage && this.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        source = this.room.storage
      }
    }

    if (source && this.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) this.moveTo(source)
    return this.store.getFreeCapacity() <= 0
  }

  public target() {
    if (this.currentConstructionSite) {
      if (this.build(this.currentConstructionSite) == ERR_NOT_IN_RANGE) {
        this.moveTo(this.currentConstructionSite.pos)
      }
      return this.store[RESOURCE_ENERGY] <= 0
    }
    let allTarget = this.myRoom.allConstructionSite
    let target: any
    if (allTarget && allTarget.length > 0) {
      // 建筑不太在乎路径，ByRange 就行
      target = this.pos.findClosestByRange(allTarget)
      this.memory.currentConstructionSite = target.id
      if (this.build(target) == ERR_NOT_IN_RANGE) this.goTo(target.pos)
      return this.store[RESOURCE_ENERGY] <= 0
    }
    let controller = this.myRoom.controller;
    if (controller && this.upgradeController(controller) == ERR_NOT_IN_RANGE) {
      this.goTo(controller.pos)
    }
    // 自己身上的能量没有了，返回 true（切换至 source 阶段）
    return this.store[RESOURCE_ENERGY] <= 0
  }

  public work() {
    // if (this.myRoom.name != this.fromRoomName) {
    //   let room = Game.rooms[this.fromRoomName]
    //   this.goTo(room.controller.pos)
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

    // 查询是否健康，不健康了就发送信息，让派人过来
    if (!this.isHealthy() && !this.memory.hasSendRebirth) {
      this.sendRebirthInfo()
    }
  }
}
