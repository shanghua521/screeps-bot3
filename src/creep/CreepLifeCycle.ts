interface CreepLifeCycle {
  /**
     * [可选] 准备阶段，接受 creep 并执行对应的准备逻辑
     * 根据其返回值判断是否准备完成，在准备完成前是不会执行下面的 target 和 source 阶段的
     */
  prepare?: () => boolean
  /**
   * [必须] 工作阶段，接受 creep 并执行对应的工作逻辑（例如建造建筑，升级控制器）
   * 在返回 true 时代表所需资源不足，将在紫萼个 tick 开始执行 source 阶段
   */
  target: () => boolean
  /**
   * [可选] 资源获取阶段，接受 creep 并执行对应的资源获取逻辑（例如获取能量，采集矿物）
   * 在返回 true 时代表能量获取完成，将在下个 tick 开始执行 target 阶段
   */
  source?: () => boolean
}
