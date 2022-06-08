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
        case 'claim':
          new CreepClaim(creep).work()
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
        case 'out-defend':
          new CreepOutDefend(creep, this.myRoom).work()
          break
      }
    }
    new TowerTask(this.myRoom).run()
    new SpawnTask(this.myRoom).run()
    new LinkTask(this.myRoom).run()
  }
}
