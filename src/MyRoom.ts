export class MyRoom extends Room {

  // 建筑信息
  public structureData: StructureData
  public sourceData: Id<Source>[]
  public harvesterData: {};
  public spawns: StructureSpawn[]

  // public spawnList: {
  //   role: string
  //   targetRoomName?: string
  //   toRoomName?: string
  //   fromRoomName?: string
  // }[]

  // public myController: StructureController
  // public myStorage: StructureStorage
  public controllerLink?: StructureLink | null
  public storageLink?: StructureLink | null


  public allSource: any[]
  public allTarget: any[]


  public allTower: StructureTower[]

  public allConstructionSite: ConstructionSite[]

  public needRepairWallAndRampart: AnyStructure[] = []

  public controller?: StructureController;
  public storage?: StructureStorage;

  public mineral: Mineral
  public extractor: StructureExtractor
  public mineralContainer: StructureContainer
  public sourceLinks: StructureLink[];
  public factory:StructureFactory

  constructor(public room: Room) {
    super(room.name);
    this.controller = room.controller
    this.storage = room.storage
    this.terminal = room.terminal

    if ((this.controller && this.controller.owner == null) || (this.controller && this.controller.reservation && this.controller.reservation.username == 'shanghua')) {
      this.initStructureData()
      this.initSourceData()
      this.initHarvesterData()
      this.initInvader()
      this.initContainerData()

      this.memory.structureIdData = this.structureData
      return
    }

    this.initLink()

    this.initStructureData()
    this.initSourceData()
    this.initHarvesterData()
    this.initSpawnList()

    this.initSpawn()
    this.initAllSource()
    this.initAllTarget()
    this.initAllConstruction()
    this.initFactory()

    this.initContainerData()

    this.initTowers()
    this.initNeedRepairWallAndRampart()
    this.initMineral()
    this.initInvader()

    this.memory.structureIdData = this.structureData
  }

  private initFactory() {
    let factory = this.find(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_FACTORY && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 2000
      }
    })
    if (factory && factory.length > 0) {
      this.factory = factory[0] as StructureFactory
    }
  }

  private initInvader() {
    let invader = this.find(FIND_HOSTILE_CREEPS, { filter: (creep) => creep.owner.username == 'Invader' })
    if (invader.length > 0) {
      this.memory.hasInvader = true
      this.memory.invaderDealTime = invader[0].ticksToLive + Game.time
    } else {
      this.memory.hasInvader = false
      this.memory.invaderDealTime = 0
    }
  }

  private initMineral() {
    let minerals = this.find(FIND_MINERALS)
    if (minerals.length <= 0) {
      return
    }

    let mineral = minerals[0]
    this.mineral = mineral

    let extractors = mineral.pos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_EXTRACTOR } })
    if (extractors.length > 0) this.extractor = extractors[0] as StructureExtractor
    let mineralContainers = mineral.pos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_CONTAINER } })
    if (mineralContainers.length > 0) this.mineralContainer = mineralContainers[0] as StructureContainer

  }

  private initNeedRepairWallAndRampart() {
    let allWall = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_WALL } })
    let needRepairWall = allWall.filter((wall) => wall.hitsMax > wall.hits)
    let allRampart = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_RAMPART } })
    let needRepairRampart = allRampart.filter((rampart) => rampart.hitsMax > rampart.hits)

    this.needRepairWallAndRampart.push(...needRepairWall)
    this.needRepairWallAndRampart.push(...needRepairRampart)
    this.needRepairWallAndRampart = this.needRepairWallAndRampart.sort((a, b) => a.hits - b.hits)
  }

  private initTowers() {
    this.allTower = this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }) as StructureTower[]
  }

  private initLink() {
    let allLink = this.find(FIND_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_LINK && structure.cooldown == 0 && structure.store.getFreeCapacity(RESOURCE_ENERGY) <= 0 }) as StructureLink[]

    if (this.memory.controllerLinkId) {
      this.controllerLink = Game.getObjectById(this.memory.controllerLinkId)
    }

    if (this.memory.storageLinkId) {
      this.storageLink = Game.getObjectById(this.memory.storageLinkId)
    }

    if (this.controller && !this.controllerLink) {
      let links = this.controller.pos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_LINK } }) as StructureLink[]
      if (links.length > 0) {
        this.controllerLink = links[0]
        this.memory.controllerLinkId = this.controllerLink.id
      }
    }
    if (this.storage && !this.storageLink) {
      let links = this.storage.pos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_LINK } }) as StructureLink[]
      if (links.length > 0) {
        this.storageLink = links[0]
        this.memory.storageLinkId = this.storageLink.id
      }
    }
    if (this.storageLink) {
      _.remove(allLink, link => link.id == this.storageLink.id)
    }
    if (this.controllerLink) {
      _.remove(allLink, link => link.id == this.controllerLink.id)
    }
    this.sourceLinks = allLink
  }

  private initAllConstruction() {
    this.allConstructionSite = this.find(FIND_MY_CONSTRUCTION_SITES)
  }

  // 初始化房间内所有源,目前是所有 container 和墓碑
  private initAllSource() {
    let allSource: any[] = []
    // let storage = room.storage
    // 所有有资源的 container
    let containers = this.find(FIND_STRUCTURES, {
      filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 200
    }) as StructureContainer[]
    // 所有的墓碑
    let tombstones = this.find(FIND_TOMBSTONES, {
      filter: (tombstone) => tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    })

    let ruins = this.find(FIND_RUINS, {
      filter: (ruin) => ruin.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    })

    // storageLink 加入 source
    let storageLink = this.storageLink
    if (storageLink && storageLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      allSource.push(storageLink)
    }
    let terminal = this.terminal
    if (terminal && terminal.pos.lookFor(LOOK_FLAGS).length == 0 && terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 5000) {
      allSource.push(terminal)
    }
    allSource.push(...containers)
    allSource.push(...tombstones)
    allSource.push(...ruins)


    // allSource.push(...droppedResources)
    this.allSource = allSource
  }

  private initAllTarget() {
    let allTarget = []
    // 找到所有的 spawn
    let spawns = this.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_SPAWN && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
      }
    })
    // 找到所有的 extensions
    let extensions = this.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
      }
    })
    // 所有的 towers
    let towers = this.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 200)
      }
    })

    let labs = this.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_LAB && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
      }
    })


    // storage 旁边的 link 也要填满
    allTarget.push(...towers)
    allTarget.push(...spawns)
    allTarget.push(...extensions)
    allTarget.push(...labs)
    this.allTarget = allTarget
  }


  // 初始化所有 spawn
  private initSpawn() {
    this.spawns = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })
  }

  // 初始化 建筑信息
  private initStructureData() {
    let structureData: StructureData = this.memory.structureIdData
    if (!structureData) structureData = {}
    this.structureData = structureData
  }

  // 初始化 source 信息
  private initSourceData() {
    let sourceData: Id<Source>[] = this.structureData.sourceData
    if (sourceData) { this.sourceData = sourceData; return }
    sourceData = []
    let sources = this.find(FIND_SOURCES)
    sources.forEach((source => sourceData.push(source.id)))
    this.sourceData = sourceData
    this.structureData.sourceData = sourceData
  }

  // 初始化 container 信息
  private initContainerData() {
    let containers = this.find(FIND_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_CONTAINER })
    let containerData = this.memory.containerData;
    if (!containerData) containerData = {}
    for (let container of containers) {
      if (!containerData[container.id]) {
        containerData[container.id] = {outCarry: [], num: 2}
      } else {
        let oneContainerData = containerData[container.id];
        _.remove(oneContainerData.outCarry, creep => Game.getObjectById(creep) == null);
        containerData[container.id] = oneContainerData
      }
    }
    for (let oneContainerData in containerData) {
      if (Game.getObjectById(oneContainerData as Id<StructureContainer>) == null) {
        delete containerData[oneContainerData]
      }
    }
    this.memory.containerData = containerData
  }

  // 初始化 source 矿工信息
  private initHarvesterData() {
    let harvesterData: HarvesterData = this.structureData.harvesterData
    if (!harvesterData) harvesterData = {}
    for (let sourceId of this.sourceData) {
      if (Object.keys(harvesterData).indexOf(sourceId) === -1) {
        harvesterData[sourceId] = {}
      }
    }
    for (let sourceId in harvesterData) {
      if (!harvesterData[sourceId]) harvesterData[sourceId] = {}
      let oneHarvester = harvesterData[sourceId]
      if (oneHarvester.containerId) {
        // 判断这个 container 还存在不，不存在就刷新
        let container = Game.getObjectById(oneHarvester.containerId)
        if (!container) {
          oneHarvester.containerId = null
        }
      }
      if (oneHarvester.harvesters) {
        oneHarvester.harvesters = _.remove(oneHarvester.harvesters, (id) => Game.getObjectById(id) != undefined)
      }
      // 初始化 source 旁的 container 信息
      if (!oneHarvester.containerId) {

        let source = Game.getObjectById(sourceId as Id<Source>)
        let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: { structureType: STRUCTURE_CONTAINER }
        })
        if (containers && containers.length > 0) oneHarvester.containerId = containers[0].id as Id<StructureContainer>
      }
    }
    this.harvesterData = harvesterData
    this.structureData.harvesterData = harvesterData
  }

  private initSpawnList() {
    // 孵化列表
    let spawnList = this.memory.spawnList
    if (!spawnList) spawnList = []
    // this.spawnList = spawnList
    this.memory.spawnList = spawnList
  }
}

interface HarvesterData {
  [sourceId: string]: {
    containerId?: Id<StructureContainer>,
    linkId?: Id<StructureLink>,
    // 一个框可以被多个挖矿的挖
    harvesters?: Id<Creep>[]
    num?: 1
  }
}

interface StructureData {
  sourceData?: any
  harvesterData?: HarvesterData
}

interface ContainerData {
  [containerId: string]: {
    outCarry?: Id<Creep>[]
    num?: 2
  }
}
