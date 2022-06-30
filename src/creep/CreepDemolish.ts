import { MyRoom } from "MyRoom";
import _ from "lodash"
import BaseCreep from "./BaseCreep"

export default class CreepDemolish extends BaseCreep {

  private working: boolean
  private stateChange = true

  constructor(public creep: Creep, public myRoom?: MyRoom) {
    super(creep)
    // 获取工作状态
    this.working = creep.memory.working
  }

  public source(): boolean {
    let prepare = Game.flags['prepare']
    let begin = Game.flags['begin']
    if (prepare) {
      this.goTo(prepare.pos)
    }
    if (begin) {
      return true
    }
    return false
  }

  public target(): boolean {
    if (this.myRoom.name != this.toRoomName) {
      let roomPosition = new RoomPosition(25, 25, this.toRoomName)
      this.moveTo(roomPosition,{reusePath:20})
      return false
    }
    // 在敌方房间里了
    let towers = this.myRoom.find(FIND_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_TOWER })
    if (towers && towers.length > 0) {
      let closeTower = this.pos.findClosestByRange(towers)
      if (this.dismantle(closeTower) == ERR_NOT_IN_RANGE) {
        this.goTo(closeTower.pos)
      }
      return false
    }

    // 在敌方房间里了
    let spawns = this.myRoom.find(FIND_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_SPAWN })
    if (spawns && spawns.length > 0) {
      let closeSpawn = this.pos.findClosestByRange(spawns)
      if (this.dismantle(closeSpawn) == ERR_NOT_IN_RANGE) {
        this.goTo(closeSpawn.pos)
      }
      return false
    }

    // 在敌方房间里了
    let extensions = this.myRoom.find(FIND_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_EXTENSION })
    if (extensions && extensions.length > 0) {
      let extension = this.pos.findClosestByRange(extensions)
      if (this.dismantle(extension) == ERR_NOT_IN_RANGE) {
        this.goTo(extension.pos)
      }
      return false
    }

    let controller = this.myRoom.controller;
    if (controller) {
      if (this.attackController(controller) == ERR_NOT_IN_RANGE) {
        this.goTo(controller.pos)
      }
      return false
    }

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
