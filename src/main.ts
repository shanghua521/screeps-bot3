import AutoPlan from "AutoPlan";
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
//  Game.spawns['Spawn2'].spawnCreep( [WORK, CARRY, CARRY, CARRY, CARRY,CARRY,CARRY,CARRY,CARRY, CARRY, CARRY, CARRY, MOVE, MOVE,MOVE,MOVE,MOVE,MOVE], 'outCarry0',{ memory: { role: 'out-carry',toRoomName:'W29S23',fromRoom:'W28S23' } } );
// Game.spawns['Spawn1'].spawnCreep( [CLAIM, CLAIM, CLAIM, MOVE, MOVE,MOVE], 'claim0',{ memory: { role: 'claim',toRoomName:'W28S23',fromRoom:'W28S23'} } );
// Game.spawns['Spawn2'].spawnCreep( [MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK,HEAL,HEAL], 'out-defend1',{ memory: { role: 'out-defend',toRoomName:'W27S23',fromRoom:'W28S23'} } );
// Game.spawns['Spawn2'].spawnCreep( [WORK, WORK, WORK, WORK, WORK,WORK,WORK,CARRY, CARRY, MOVE, MOVE,MOVE, MOVE], 'out-harvest1',{ memory: { role: 'out-harvest',toRoomName:'W29S23',fromRoom:'W28S23' } } );
// Game.spawns['Spawn2'].spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,], 'seesaw', { memory: { role: 'seesaw', toRoomName: 'W26S23', fromRoom: 'W28S23' } });

// Game.spawns['Spawn2'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,WORK,WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,MOVE,MOVE], 'demolish', { memory: { role: 'demolish', toRoomName: 'W26S23', fromRoom: 'W28S23' } });
// Game.spawns['Spawn2'].spawnCreep( [TOUGH, WORK, WORK, WORK, WORK,WORK,CARRY,CARRY, CARRY, MOVE, MOVE,MOVE, MOVE,MOVE, MOVE,MOVE, MOVE,MOVE,MOVE], 'temp7',{ memory: { role: 'temp',targetRoomName:'W28S23',fromRoom:'W28S23' } } );

// Game.spawns['Spawn3'].spawnCreep( [WORK, CARRY, MOVE], 'harvester12',{ memory: { role: 'harvester',toRoomName:'W22S23',fromRoom:'W22S23'} } );

// Game.spawns['Spawn2'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], 'out-harvest11', { memory: { role: 'out-harvest', toRoomName: 'W23S23', fromRoom: 'W22S23' } });
//Game.spawns['Spawn3'].spawnCreep( [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,WORK, WORK, WORK, WORK,WORK, WORK, WORK, WORK,WORK,CARRY, MOVE, MOVE, MOVE,MOVE, MOVE, MOVE,MOVE, MOVE,MOVE], 'rush1',{ memory: { role: 'rush',targetRoomName:'W22S23',fromRoom:'W22S23' } } );

// Game.market.createOrder({
//   type: ORDER_SELL,
//   resourceType: RESOURCE_OXYGEN,
//   price: 2.1,
//   totalAmount: 50000,
//   roomName: "W28S23"
// });
export const loop = ErrorMapper.wrapLoop(() => {
  // 清理内存
  if (Game.time % 1000 == 0) dealMemory()
  // Game.rooms['W22S23'].visual.text("aaaa", 26, 14)

  // 生成 pixel
  if (Game.cpu.bucket >= 10000) if (Game.cpu.generatePixel) Game.cpu.generatePixel()
  for (let room of Object.values(Game.rooms)) {
    const start = Game.cpu.getUsed();
    new RoomTask(room).run()
    const end = Game.cpu.getUsed();
    // cpu 占用
    const total = end - start;
    room.visual.text(`CPU: ${total.toFixed(2)}`, 3, 3);
    // if (room.name == "W22S23") {
    //   new AutoPlan(room).showArea()
    // }
  }
  // new FlagMissing().run()
});
