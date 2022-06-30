import { MyRoom } from "./MyRoom";

export default class SpawnTask {

  private allPart = [WORK, CARRY, MOVE, ATTACK, RANGED_ATTACK, HEAL, CLAIM, TOUGH]

  private roleLevelData: {
    [role: string]: {
      [index: number]: {
        bodypart: number[],
        num: number
      }
    }
  } = {
      'harvester': {
        1: { bodypart: [2, 1, 1, 0, 0, 0, 0, 0], num: 2 },
        2: { bodypart: [3, 1, 2, 0, 0, 0, 0, 0], num: 2 },
        3: { bodypart: [5, 1, 3, 0, 0, 0, 0, 0], num: 2 },
        4: { bodypart: [5, 1, 3, 0, 0, 0, 0, 0], num: 2 },
        5: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
        6: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
        7: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
        8: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
      },
      'carrier': {
        1: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 2 },
        2: { bodypart: [0, 3, 3, 0, 0, 0, 0, 0], num: 2 },
        3: { bodypart: [0, 4, 4, 0, 0, 0, 0, 0], num: 2 },
        4: { bodypart: [0, 6, 6, 0, 0, 0, 0, 0], num: 2 },
        5: { bodypart: [0, 6, 6, 0, 0, 0, 0, 0], num: 2 },
        6: { bodypart: [0, 6, 6, 0, 0, 0, 0, 0], num: 1 },
        7: { bodypart: [0, 6, 6, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [0, 6, 6, 0, 0, 0, 0, 0], num: 0 },
      },
      'upgrader': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 4 },
        2: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 3 },
        3: { bodypart: [3, 3, 6, 0, 0, 0, 0, 0], num: 3 },
        4: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 2 },
        // 5: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 2 },
        5: { bodypart: [5, 2, 5, 0, 0, 0, 0, 0], num: 2 },
        6: { bodypart: [5, 2, 5, 0, 0, 0, 0, 0], num: 2 },
        7: { bodypart: [10, 2, 10, 0, 0, 0, 0, 0], num: 2 },
        8: { bodypart: [15, 3, 15, 0, 0, 0, 0, 0], num: 1 },
      },
      'manage': {
        1: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 1 },
        5: { bodypart: [0, 10, 5, 0, 0, 0, 0, 0], num: 1 },
        6: { bodypart: [0, 15, 5, 0, 0, 0, 0, 0], num: 1 },
        7: { bodypart: [0, 20, 10, 0, 0, 0, 0, 0], num: 1 },
        8: { bodypart: [0, 32, 16, 0, 0, 0, 0, 0], num: 1 },
      },
      'builder': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 1 },
        2: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 1 },
        3: { bodypart: [3, 3, 6, 0, 0, 0, 0, 0], num: 1 },
        4: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 1 },
        5: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [5, 5, 10, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [10, 10, 10, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [15, 15, 15, 0, 0, 0, 0, 0], num: 0 },
      },
      'rush': {
        6: { bodypart: [17, 1, 9, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [39, 1, 10, 0, 0, 0, 0, 0], num: 0 },
      },
      'mineral': {
        1: { bodypart: [2, 1, 1, 0, 0, 0, 0, 0], num: 2 },
        2: { bodypart: [3, 1, 2, 0, 0, 0, 0, 0], num: 2 },
        3: { bodypart: [5, 1, 3, 0, 0, 0, 0, 0], num: 2 },
        4: { bodypart: [5, 1, 3, 0, 0, 0, 0, 0], num: 2 },
        5: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
        6: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
        7: { bodypart: [10, 2, 5, 0, 0, 0, 0, 0], num: 2 },
        8: { bodypart: [10, 2, 5, 0, 0, 0, 0, 0], num: 2 },
      },
      'claim': {
        1: { bodypart: [0, 0, 1, 0, 0, 0, 1, 0], num: 2 },
        2: { bodypart: [0, 0, 1, 0, 0, 0, 1, 0], num: 2 },
        3: { bodypart: [0, 0, 1, 0, 0, 0, 1, 0], num: 2 },
        4: { bodypart: [0, 0, 1, 0, 0, 0, 1, 0], num: 2 },
        5: { bodypart: [0, 0, 1, 0, 0, 0, 1, 0], num: 2 },
        6: { bodypart: [0, 0, 1, 0, 0, 0, 1, 0], num: 2 },
        7: { bodypart: [0, 0, 1, 0, 0, 0, 1, 0], num: 2 },
        8: { bodypart: [0, 0, 1, 0, 0, 0, 1, 0], num: 2 },
      },
      'out-harvest': {
        1: { bodypart: [1, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [1, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [1, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [5, 1, 3, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
        6: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
        7: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
        8: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
      },
      'out-carry': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [1, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [1, 2, 3, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [1, 5, 3, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [1, 7, 4, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [1, 11, 6, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [2, 20, 11, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [2, 30, 16, 0, 0, 0, 0, 0], num: 0 },
      },
      'out-carry2': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [1, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [1, 2, 3, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [1, 5, 3, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [1, 7, 4, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [1, 11, 6, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [2, 20, 11, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [2, 30, 16, 0, 0, 0, 0, 0], num: 0 },
      },
      'out-defend': {
        1: { bodypart: [0, 0, 1, 0, 0, 1, 0, 0], num: 0 },
        2: { bodypart: [0, 0, 1, 0, 0, 1, 0, 0], num: 0 },
        3: { bodypart: [0, 0, 1, 0, 0, 1, 0, 0], num: 0 },
        4: { bodypart: [0, 0, 3, 0, 2, 2, 0, 0], num: 0 },
        5: { bodypart: [0, 0, 6, 0, 3, 3, 0, 0], num: 0 },
        6: { bodypart: [0, 0, 8, 0, 4, 4, 0, 0], num: 0 },
        7: { bodypart: [0, 0, 16, 0, 8, 8, 0, 0], num: 0 },
        8: { bodypart: [0, 0, 20, 0, 10, 10, 0, 0], num: 0 },
      },
      'watch': {
        1: { bodypart: [0, 0, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [0, 0, 1, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [0, 0, 1, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [0, 0, 1, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [0, 0, 1, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [0, 0, 1, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [0, 0, 1, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [0, 0, 1, 0, 0, 0, 0, 0], num: 0 },
      }
    }

  constructor(public myRoom: MyRoom) { }

  // 这里代码可以优化
  public run() {
    let time = Game.time
    // 看看有没有爬虫要死了
    // this.myRoom.spawnList = this.myRoom.memory.spawnList
    _.remove(this.myRoom.memory.spawnList, creepInfo => creepInfo == null);
    let spawnList = _.filter(this.myRoom.memory.spawnList,creepInfo => creepInfo.rebirthTime == null || creepInfo.rebirthTime < Game.time )

    // carrier 优先重生保证有人搬资源
    spawnList.sort((a, _b) => {
      if (a.role == 'carrier') {
        return -1
      }
      return 0
    })
    // _.remove(spawnList, (creepInfo) => creepInfo.rebirthTime != null && creepInfo.rebirthTime > Game.time);

    if (spawnList && spawnList.length > 0) {
      let spawns = this.myRoom.spawns
      // 遍历所有 spawn 让她孵化 creep
      for (let spawn of spawns) {
        // 如果正在孵化，跳过
        if (spawn.spawning) continue
        let newCreep = spawnList[0]
        if (!newCreep) {
          spawnList.shift()
          continue
        }

        // 根据 bodypart 生成身体部件信息
        let role = newCreep.role
        let level = spawn.room.controller!.level
        // 目标房间，可能是 null
        let targetRoomName = newCreep.targetRoomName
        if (!targetRoomName) targetRoomName = newCreep.toRoomName
        let body = this.genCreepBodyWithRoomLevel(role, level)
        let index = 0
        let mark = spawn.spawnCreep(body, `${role}${index}`, { memory: { role: role, targetRoomName: targetRoomName, fromRoom: spawn.room.name, toRoomName: newCreep.toRoomName, hasSendRebirth: false } })
        // 如果有同名，那就名字index++
        while (mark == ERR_NAME_EXISTS) {
          index++
          mark = spawn.spawnCreep(body, `${role}${index}`, { memory: { role: role, targetRoomName: targetRoomName, fromRoom: spawn.room.name, toRoomName: newCreep.toRoomName, hasSendRebirth: false } })
        }
        // 如果成功了，给清掉
        if (mark == OK) {
          // this.myRoom.spawnList.shift()
          // this.myRoom.memory.spawnList.shift()
          for (let i in this.myRoom.memory.spawnList) {
            if (this.eq(this.myRoom.memory.spawnList[i], newCreep)) {
              delete this.myRoom.memory.spawnList[i]
              break
            }
          }
          break
        }
        _.remove(this.myRoom.memory.spawnList, creepInfo => creepInfo == null);

        // 能量不够
        // while (mark == ERR_NOT_ENOUGH_ENERGY && level > 1) {
        //   // 生成低一级的 creep
        //   level--
        //   body = this.genCreepBodyWithRoomLevel(role, level)
        //   mark = spawn.spawnCreep(body, `${role}${index}`, { memory: { role: role, targetRoomName: targetRoomName, fromRoom: spawn.room.name, hasSendRebirth: false } })
        // }
        // if (mark == OK) {
        //   this.room.spawnList.shift()
        //   this.room.memory.spawnList.shift()
        //   break
        // }
      }
    }
  }


  private eq(value: creepInfo, other: creepInfo) {
    return value.role == other.role && value.toRoomName == other.toRoomName && (value.rebirthTime == null || value.rebirthTime < Game.time)
  }

  // 根据 bodypart 组装出 body
  private genCreepBodyWithRoomLevel(role: string, level: number): BodyPartConstant[] {
    let bodypart: number[] = this.roleLevelData[role][level].bodypart
    let body: BodyPartConstant[] = []
    for (let index in bodypart) {
      let part = bodypart[index]
      for (; part != 0; part--) {
        body.push(this.allPart[index])
      }
    }
    return body
  }
}
interface creepInfo {
  role: string
  targetRoomName ?: string
  toRoomName ?: string
  fromRoomName ?: string
  rebirthTime ?: number
}
