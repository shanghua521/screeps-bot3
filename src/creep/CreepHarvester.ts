import { MyRoom } from "MyRoom"
import _ from "lodash"
import BaseCreep from "./BaseCreep"

export default class CreepHarvester extends BaseCreep {

  public working: boolean
  public stateChange = true
  public currentSource: Source
  private currentContainer: StructureContainer

  // public fromRoom: string
  // public toRoomName: string
  // private currentHarvester: {
  //   containerId?: Id<StructureContainer>,
  //   linkId?: Id<StructureLink>,
  //   harvester?: Id<Creep>
  // }

  constructor(public creep: Creep, public myRoom?: MyRoom) {
    super(creep)
    this.toRoomName = this.memory.toRoomName
    // 获取工作状态
    this.working = this.memory.working
  }

  public initSource() {
    let sourceId = this.memory.sourceId
    if (sourceId) {
      this.currentSource = Game.getObjectById(sourceId)
    }
    else {
      // 获取房间的 harvesterData 信息
      let harvesterData = this.myRoom.structureData.harvesterData
      for (let sourceStrId in harvesterData) {
        let oneHarvester = harvesterData[sourceStrId]
        // 名字好怪
        let harvesters = oneHarvester.harvesters

        if (!harvesters) harvesterData[sourceStrId].harvesters = harvesters = []
        if (!oneHarvester.num) oneHarvester.num = 1

        // 如果没人占用的话，有位置的话
        if (harvesters.length < oneHarvester.num) {
          // 改成我的 id
          harvesterData[sourceStrId].harvesters.push(this.id)
          sourceId = sourceStrId as Id<Source>
          // 绑定 source
          this.currentSource = Game.getObjectById(sourceId)
          this.memory.sourceId = sourceId
          break
        }
      }
      this.myRoom.structureData.harvesterData = harvesterData
    }
    if (sourceId) {
      let currentHarvester = this.myRoom.structureData.harvesterData[sourceId.toString()]
      if (currentHarvester && currentHarvester.containerId) this.currentContainer = Game.getObjectById(currentHarvester.containerId)
    }
  }

  public source(): boolean {
    let dropResource = this.pos.lookFor(LOOK_RESOURCES)
    if (dropResource.length > 0) {
      this.pickup(dropResource[0])
      return this.store.getFreeCapacity(RESOURCE_ENERGY) <= 0
    }

    if (this.harvest(this.currentSource) == ERR_NOT_IN_RANGE) {
      this.moveTo(this.currentSource)
    }
    let workCount = this.body.filter((part) => part.type == WORK).length
    return this.store.getFreeCapacity(RESOURCE_ENERGY) < (workCount * 3)
  }

  public target(): boolean {
    // 先填 link
    let links = this.pos.findInRange(FIND_STRUCTURES, 1, { filter: (structure) => structure.structureType == STRUCTURE_LINK && structure as StructureLink && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
    if (links && links.length > 0) {
      if (this.transfer(links[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.goTo(links[0].pos)
      }
      return this.store[RESOURCE_ENERGY] <= 0
    }
    // 先填 container
    if (this.currentContainer) {
      // 先修
      if (this.currentContainer.hits < this.currentContainer.hitsMax) {
        if (this.repair(this.currentContainer) == ERR_NOT_IN_RANGE) {
          this.moveTo(this.currentContainer)
        }
        return this.store[RESOURCE_ENERGY] <= 0
      }
      // 走到 container 上再挖矿，这样就算能量漏了也能被 container 接住
      // || !this.pos.isEqualTo(this.currentContainer.pos)
      if (this.transfer(this.currentContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(this.currentContainer)
      }
      return this.store[RESOURCE_ENERGY] <= 0
    }
    if (!links || links.length == 0) {
      // 没有就修建筑工地
      let constructionSite = this.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3)
      if (constructionSite && constructionSite.length > 0) this.build(constructionSite[0])
      // 没有建筑工地就创建一个
      else this.pos.createConstructionSite(STRUCTURE_CONTAINER)
    }
    // 自己身上没有资源了
    return this.store[RESOURCE_ENERGY] <= 0
  }

  public work() {

    // 判断是否在我要工作的房间
    if (this.isInRightRoom()) {
      this.initSource()
    } else {
      // isInRightRoom 会自动往 目标房间前进
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
      // 把自己从占用删掉
      _.remove(this.myRoom.structureData.harvesterData[this.currentSource.id].harvesters, (harvesterId) => harvesterId == this.id)
    }
  }
}
