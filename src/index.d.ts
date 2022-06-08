interface CreepMemory {
  prePos?: string

  currentMineralId?: Id<Mineral>

  /**
   * 该 creep 的角色
   */
  role?: string
  /**
   * 状态
   */
  status?: number

  // 执行的状态
  working?: boolean

  // 占用的 sourceId
  sourceId?: Id<Source>

  // 是否已发送健康信息
  hasSendRebirth?: Boolean

  // 当前工作的建筑工地
  currentConstructionSite?: Id<ConstructionSite>

  // 当前使用的 container
  currentContainer?: Id<StructureContainer>

  // 修复建筑的目标 hits
  fixTargetHits?: number,

  // 修复建筑的 id
  fixTargetId?: Id<AnyStructure>

  // 到哪里去
  targetRoomName?: string

  // 备份到哪里去
  toRoomName?: string

  // 从哪里来
  fromRoom?: string

  // 移动数据
  moveData?: {
    // 目标位置
    targetPos?: string
    // 路径
    path?: string
    // 移动索引
    index?: number
  }

  // 是否站立不动
  standee?: boolean

  collectRubbishMode?:boolean
}

interface Memory {
  flagMissingData: any
}

interface SpawnMemory {
  spawnList: string[]
}

// source 信息
interface SourceHarvesterCount {
  sourceId: Id<Source>,
  // 占用这个 source 的 harvester 的数量
  count: number
}

// interface MyRoom extends Room {

// }

interface RoomMemory {
  storageLinkId: Id<StructureLink>
  controllerLinkId: Id<StructureLink>
  // 不能仅仅放入 role 名，还需要自己的信息
  spawnList: {
    role: string
    targetRoomName?: string
    toRoomName?: string
    fromRoomName?: string
    rebirthTime?:number
  }[]
  structureIdData: any

  // 最大的正方形
  area?: string

  // 是否有 NPC 入侵者
  hasInvader: boolean

  // 入侵者死亡时间
  invaderDealTime:number
}
interface RoomTerrain {
  getRawBuffer: () => number[]
}

declare module NodeJS {
  interface Global {
    routeCache:{}
  }
}
