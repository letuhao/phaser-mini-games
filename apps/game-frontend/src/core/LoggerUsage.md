# Logger Usage Guide

## Overview

The Logger system provides flexible, configurable logging with object-specific settings and level filtering. It's designed to scale with large projects and make debugging easier.

## Basic Usage

### Import and Use

```typescript
import { logInfo, logDebug, logError, logger } from '../core/Logger';

// Simple logging
logInfo('Embers', 'Ember effect initialized');

// Logging with data objects
logDebug('Embers', 'Spawn area calculated', {
    x: 0,
    y: 1240,
    width: 2560,
    height: 200
});

// Error logging
logError('Embers', 'Failed to spawn ember', errorObject);
```

### Using the Logger Instance

```typescript
import { logger } from '../core/Logger';

logger.info('Embers', 'Ember effect initialized');
logger.debug('Embers', 'Spawn area calculated', spawnData);
logger.error('Embers', 'Failed to spawn ember', errorObject);
```

## Configuration

### Default Configuration

By default, the logger is configured with:
- **Global Level**: INFO
- **JSON Formatting**: Enabled (better for AI readability)
- **Console Colors**: Enabled
- **Timestamps**: Enabled
- **Object Names**: Enabled

### Object-Specific Settings

```typescript
import { logger, LogLevel } from '../core/Logger';

// Enable/disable logging for specific objects
logger.setObjectEnabled('Fireflies', true);
logger.setObjectEnabled('Rain', false);

// Set log level for specific objects
logger.setObjectLevel('Embers', LogLevel.DEBUG);
logger.setObjectLevel('Button', LogLevel.WARN);

// Change global log level
logger.setGlobalLevel(LogLevel.DEBUG);
```

### Dynamic Configuration

```typescript
import { logger } from '../core/Logger';

// Toggle JSON formatting
logger.setUseJsonStringify(false); // Use toString() instead

// Toggle console colors
logger.setConsoleColors(false);

// Update multiple settings at once
logger.updateConfig({
    globalLevel: LogLevel.DEBUG,
    formatOptions: {
        showTimestamp: false,
        useJsonStringify: true
    }
});
```

## Log Levels

1. **ERROR** (0): Critical errors that need immediate attention
2. **WARN** (1): Warning conditions that might need attention
3. **INFO** (2): General information about program execution
4. **DEBUG** (3): Detailed information for debugging
5. **TRACE** (4): Very detailed information for tracing execution

## Object Categories

### Effects
- `Embers` - Ember particle effect
- `Fireflies` - Firefly effect
- `StarGrow` - Star growth effect
- `AutumnLeaves` - Autumn leaves effect
- `Rain` - Rain effect
- `Wind` - Wind effect
- `LensFlare` - Lens flare effect
- `WaterSurface` - Water surface effect

### Core Systems
- `ResponsiveManager` - Screen responsiveness management
- `GroupNode` - Group node management
- `ObjectLoader` - Object loading system

### UI Components
- `Button` - Button components
- `GrowText` - Text animation components

### Scenes
- `LevisR3WheelScene` - Main game scene
- `WheelScene` - Wheel scene
- `BootScene` - Boot scene

## Example: Embers Effect

```typescript
import { logDebug, logInfo, logError } from '../core/Logger';

export class Embers {
    constructor(scene: Phaser.Scene, opts: Opts = {}) {
        logInfo('Embers', 'Constructor called with options', opts);
        
        // ... constructor logic ...
        
        logDebug('Embers', 'Root container created', this.root);
    }
    
    updateContainerBounds(bounds: any) {
        logDebug('Embers', 'Container bounds updated', {
            bounds,
            wasFirstTime: !this.containerBounds
        });
        
        // ... update logic ...
    }
    
    private resetAndTween(sp: Phaser.GameObjects.Image) {
        logDebug('Embers', 'resetAndTween called for sprite', sp);
        
        try {
            // ... spawn logic ...
            logDebug('Embers', 'Ember positioned and styled', {
                position: { x, y },
                scale: { start: scaleStart, end: scaleEnd },
                alpha: alphaStart
            });
        } catch (error) {
            logError('Embers', 'Failed to position ember', error);
        }
    }
}
```

## Benefits

1. **Selective Logging**: Only see logs from objects you care about
2. **Level Filtering**: Control verbosity per object
3. **AI-Friendly**: JSON formatting makes logs easier for AI models to parse
4. **Performance**: Disabled logging has minimal overhead
5. **Scalability**: Easy to add new objects and configure logging
6. **Debugging**: Colored console output for better readability

## Migration from console.log

### Before (Old Way)
```typescript
console.log('[Embers] Constructor called with options:', {
    pool,
    spawnArea: this.spawnArea,
    baseY: this.baseY
});
```

### After (New Way)
```typescript
import { logInfo } from '../core/Logger';

logInfo('Embers', 'Constructor called with options', {
    pool,
    spawnArea: this.spawnArea,
    baseY: this.baseY
});
```

## Configuration Examples

### Development Mode (Verbose)
```typescript
logger.updateConfig({
    globalLevel: LogLevel.DEBUG,
    formatOptions: {
        useJsonStringify: true,
        showTimestamp: true,
        showLogLevel: true,
        showObjectName: true
    }
});
```

### Production Mode (Minimal)
```typescript
logger.updateConfig({
    globalLevel: LogLevel.WARN,
    formatOptions: {
        useJsonStringify: false,
        showTimestamp: false,
        showLogLevel: false,
        showObjectName: true
    }
});
```

### Debug Specific Object
```typescript
// Only see Embers logs at DEBUG level
logger.setGlobalLevel(LogLevel.ERROR); // Suppress other logs
logger.setObjectLevel('Embers', LogLevel.DEBUG);
logger.setObjectEnabled('Embers', true);
logger.setObjectEnabled('Button', false);
logger.setObjectEnabled('ResponsiveManager', false);
```
