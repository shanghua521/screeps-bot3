import FlagMissing from "FlagMissing";
import RoomTask from "RoomTask";
import { ErrorMapper } from "utils/ErrorMapper";

declare global {
  interface Memory {
    uuid: number;
    log: any;
  }

  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

function dealMemory() {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name]
    }
  }
}

// Game.spawns['Spawn1'].spawnCreep( [WORK, WORK, WORK, WORK, CARRY,CARRY,CARRY,CARRY, MOVE, MOVE, MOVE,MOVE, MOVE, MOVE,MOVE, MOVE], 'upgrader3',{ memory: { role: 'upgrader',targetRoomName:'W28S23',fromRoom:'W28S22' } } );
// Game.spawns['Spawn1'].spawnCreep( [WORK, WORK, WORK, WORK, WORK,WORK,WORK,CARRY, CARRY, MOVE, MOVE,MOVE, MOVE], 'harvester3',{ memory: { role: 'harvester',targetRoomName:'W28S23',fromRoom:'W28S22' } } );
// Game.spawns['Spawn1'].spawnCreep( [WORK, WORK, WORK, WORK, CARRY,CARRY,CARRY,CARRY, MOVE, MOVE, MOVE,MOVE, MOVE, MOVE,MOVE, MOVE], 'builder3',{ memory: { role: 'builder',targetRoomName:'W28S23',fromRoom:'W28S22' } } );
// Game.spawns['Spawn1'].spawnCreep( [CARRY, CARRY, CARRY, CARRY, CARRY,CARRY,CARRY,CARRY, MOVE, MOVE, MOVE,MOVE, MOVE, MOVE], 'carrier1',{ memory: { role: 'carrier',targetRoomName:'W28S23',fromRoom:'W28S22' } } );
//  Game.spawns['Spawn2'].spawnCreep( [WORK, CARRY, CARRY, CARRY, CARRY,CARRY,CARRY,CARRY, MOVE, MOVE,MOVE,MOVE], 'outCarry0',{ memory: { role: 'out-carry',toRoomName:'W29S23',fromRoom:'W28S23' } } );
// Game.spawns['Spawn1'].spawnCreep( [CLAIM, CLAIM, CLAIM, MOVE, MOVE,MOVE], 'claim0',{ memory: { role: 'claim',toRoomName:'W28S23',fromRoom:'W28S23'} } );
// Game.spawns['Spawn2'].spawnCreep( [MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK,HEAL,HEAL], 'out-defend1',{ memory: { role: 'out-defend',toRoomName:'W27S23',fromRoom:'W28S23'} } );
// Game.spawns['Spawn2'].spawnCreep( [WORK, WORK, WORK, WORK, WORK,WORK,WORK,CARRY, CARRY, MOVE, MOVE,MOVE, MOVE], 'out-harvest1',{ memory: { role: 'out-harvest',toRoomName:'W29S23',fromRoom:'W28S23' } } );
export const loop = ErrorMapper.wrapLoop(() => {
  // 清理内存
  if (Game.time % 1000 == 0) dealMemory()
  // 生成 pixel
  if (Game.cpu.bucket >= 10000) if (Game.cpu.generatePixel) Game.cpu.generatePixel()
  for (let room of Object.values(Game.rooms)) {
    new RoomTask(room).run()
    // new AutoPlan(room).showArea()
  }
  new FlagMissing().run()
});
