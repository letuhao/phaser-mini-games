import Phaser from 'phaser';
import { ObjectLoader } from '../objects/ObjectLoader';
import { logInfo, logDebug } from '../core/Logger';

export class WheelScene extends Phaser.Scene {
    private objects: Record<string, Phaser.GameObjects.GameObject> = {};
    private objectLoader: ObjectLoader;
    
    constructor() {
        super({ key: 'WheelScene' });
        this.objectLoader = new ObjectLoader();
    }
    
    create() {
        logInfo('WheelScene', 'Starting scene creation', undefined, 'create');
        
        // Load objects using the new ObjectLoader
        this.objects = this.objectLoader.loadObjects(this, this.getObjectsConfig());
        
        logInfo('WheelScene', 'Scene creation completed', undefined, 'create');
    }
    
    private getObjectsConfig() {
        // This would come from your configuration file
        // For now, returning an empty array as placeholder
        return [];
    }
}
