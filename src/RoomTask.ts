import CreepBuilder from "./creep/CreepBuilder"
import CreepCarry from "./creep/CreepCarry"
import CreepCHarvester from "./creep/CreepOutHarvester"
import CreepClaim from "./creep/CreepClaim"
import CreepHarvester from "./creep/CreepHarvester"
import CreepMineral from "./creep/CreepMineral"
import CreepOutCarry from "./creep/CreepOutCarry"
import CreepOutDefend from "./creep/CreepOutDefend"
import CreepUpgrader from "./creep/CreepUpgraper"
import LinkTask from "./LinkTask"
import { MyRoom } from "./MyRoom"
import SpawnTask from "./SpawnTask"
import TowerTask from "./TowerTask"
import CreepOutHarvester from "./creep/CreepOutHarvester"
import LabTask from "LabTask"
import CreepHeal from "creep/CreepHeal"
import CreepTough from "creep/CreepTough"
import CreepSeesaw from "creep/CreepSeesaw"
import CreepDemolish from "creep/CreepDemolish"
import TempCreep from "creep/TempCreep"
import CreepOutCarry2 from "creep/CreepOutCarry2"
import CreepManage from "creep/CreepManage"
import CreepWatch from "creep/CreepWatch"
import CreepRush from "creep/CreepRush"
import FactoryTask from "FactoryTask"

export default class RoomTask {

  private creeps: Creep[]
  private myRoom: MyRoom

  constructor(public room: Room) {
    this.myRoom = new MyRoom(room)
    this.creeps = this.myRoom.find(FIND_MY_CREEPS)
  }

  public run() {
    // 在 creep 都执行工作完成后
    for (let creep of this.creeps) {
      if (creep.spawning) continue
      switch (creep.memory.role) {
        case 'harvester':
          new CreepHarvester(creep, this.myRoom).work()
          break
        case 'carrier':
          new CreepCarry(creep, this.myRoom).work()
          break
        case 'upgrader':
          new CreepUpgrader(creep, this.myRoom).work()
          break
        case 'builder':
          new CreepBuilder(creep, this.myRoom).work()
          break
        case 'manage':
          new CreepManage(creep, this.myRoom).work()
          break
        case 'claim':
          new CreepClaim(creep).work()
          break
        case 'watch':
          new CreepWatch(creep).work()
          break
        case 'cHarvester':
          new CreepCHarvester(creep, this.myRoom).work()
          break
        case 'mineral':
          new CreepMineral(creep, this.myRoom).work()
          break
        case 'out-harvest':
          new CreepOutHarvester(creep, this.myRoom).work()
          break
        case 'out-carry':
          new CreepOutCarry(creep, this.myRoom).work()
          break
        case 'out-carry2':
          new CreepOutCarry2(creep, this.myRoom).work()
          break
        case 'rush':
          new CreepRush(creep, this.myRoom).work()
          break
        case 'out-defend':
          new CreepOutDefend(creep, this.myRoom).work()
          break
        case 'heal':
          new CreepHeal(creep, this.myRoom).work()
          break
        case 'seesaw':
          new CreepSeesaw(creep, this.myRoom).work()
          break
        case 'demolish':
          new CreepDemolish(creep, this.myRoom).work()
          break
        case 'temp':
          new TempCreep(creep, this.myRoom).work()
          break
      }
    }
    if (this.myRoom.controller && this.myRoom.controller.owner == null) {
      return
    }
    new TowerTask(this.myRoom).run()
    new SpawnTask(this.myRoom).run()
    new LinkTask(this.myRoom).run()
    new LabTask(this.myRoom).run()
    new FactoryTask(this.myRoom).run()
  }
}
