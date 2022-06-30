import { MyRoom } from "./MyRoom";

export default class LinkTask {

  constructor(private room: MyRoom) { }

  public run() {
    let storageLink = this.room.storageLink
    let controllerLink = this.room.controllerLink
    let sourceLinks = this.room.sourceLinks
    for (let sourceLink of sourceLinks) {
      if (controllerLink && controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
        sourceLink.transferEnergy(controllerLink)
      } else if (storageLink && storageLink.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
        sourceLink.transferEnergy(storageLink)
      }
    }
  }
}
