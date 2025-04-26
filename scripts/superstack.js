import { world, system, ItemStack } from "@minecraft/server"

// About the project

// SuperStack
// GitHub:          https://github.com/Carchi777/SuperStack
// Discord:         

// Made by Carchi77
// My Github:       https://github.com/Carchi777
// My Discord:      https://discordapp.com/users/985593016867778590


world.afterEvents.playerSpawn.subscribe(({ player }) => {
    if (!world.getDynamicProperty('SuperStack')) {
        const l = player.location
        world.setDynamicProperty('SuperStack', { x: l.x, y: 319, z: l.z })
        player.runCommand(`/tickingarea add ${l.x} 319 ${l.z} ${l.x} 319 ${l.z} SuperStack`);
    }
})

/*@class SuperStack**/
export class SuperStack {
    itemStack;
    /**@param {ItemStack} itemStack */
    constructor(itemStack) {
        this.itemStack = itemStack
    }
    /** @returns {{content:ItemStack[],isValid:boolean}}*/
    getContainer() {
        const itemStack = this.itemStack;
        const dimension = world.getDimension('overworld')
        const location = world.getDynamicProperty('SuperStack');
        if (!['shulker_box', 'bundle'].some(k => itemStack?.typeId.endsWith(k))) return { content: [], isValid: false }

        dimension.spawnItem(itemStack, location).applyDamage(5, { cause: "lava" })

        const entities = dimension.getEntities({ location, type: 'minecraft:item', maxDistance: 1 })
        const content = entities.map(k => k.getComponent('item').itemStack)
        entities.forEach(k => k.remove())
        return { content, isValid: true };
    }
    getData() {
        const itemStack = this.itemStack;
        const acceptedValues = [
            'minecraft:arrow',
            'minecraft:potion',
            'minecraft:splash_potion',
            'minecraft:lingering_potion',
            'minecraft:ominous_bottle',
            'minecraft:goat_horn',
            'minecraft:bed',
            'minecraft:banner',
            'minecraft:firework_rocket',
            'minecraft:firework_star',
        ]
        if (!acceptedValues.some(k => k == itemStack?.typeId)) {
            return 0
        }
        const location = world.getDynamicProperty('SuperStack')
        const entity = world.getDimension('overworld').spawnEntity(`super:stack`, location)
        const inv = entity.getComponent('inventory')?.container

        inv.setItem(0, itemStack)
        let data = 0
        for (data; data < 100; data++) {
            const success = entity.runCommand(`/testfor @e[type=super:stack,r=1,hasitem={item=${itemStack.typeId},data=${data},slot=0,location=slot.inventory}]`).successCount
            if (success >= 1) break;
        }
        entity.remove()
        return data
    }
    /**@param {number} data */
    setData(data) {
        const itemStack = this.itemStack;
        const acceptedValues = [
            'minecraft:arrow',
            'minecraft:potion',
            'minecraft:splash_potion',
            'minecraft:lingering_potion',
            'minecraft:ominous_bottle',
            'minecraft:goat_horn',
            'minecraft:bed',
            'minecraft:banner',
            'minecraft:firework_rocket',
            'minecraft:firework_star',
        ]
        if (!acceptedValues.some(k => k == itemStack?.typeId)) {
            return 0
        }
        if (itemStack.typeId == 'minecraft:arrow' && data < 6 && data != 0) data = 6
        const location = world.getDynamicProperty('SuperStack')
        const entity = world.getDimension('overworld').spawnEntity(`super:stack`, location)
        const inv = entity.getComponent('inventory')?.container
        entity.runCommand(`/replaceitem entity @e[type=super:stack] slot.inventory 0 ${itemStack.typeId} ${itemStack.amount} ${data}`)
        const newitemStack = inv.getItem(0)
        entity.remove()
        this.itemStack = newitemStack
        return this
    }
}
