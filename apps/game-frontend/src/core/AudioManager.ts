import { ISound, IAudio } from '../objects/types';
import { logInfo, logDebug, logWarn, logError } from './Logger';

/**
 * Audio Manager using the Audio Pattern
 * Manages sound playback, volume control, and audio effects
 */
export class AudioManager {
    private sounds: Map<string, ISound> = new Map();
    private audioObjects: Map<string, IAudio> = new Map();
    private globalVolume: number = 1.0;
    private globalMute: boolean = false;
    private soundGroups: Map<string, Set<string>> = new Map();
    
    constructor() {
        logInfo('AudioManager', 'Initialized', {
            note: "Ready to manage audio and sound effects"
        }, 'constructor');
    }
    
    /**
     * Register a sound object
     */
    registerSound(id: string, sound: ISound, group?: string): void {
        this.sounds.set(id, sound);
        
        if (group) {
            if (!this.soundGroups.has(group)) {
                this.soundGroups.set(group, new Set());
            }
            this.soundGroups.get(group)!.add(id);
        }
        
        logDebug('AudioManager', 'Sound registered', {
            soundId: id,
            group: group || 'default',
            totalSounds: this.sounds.size
        }, 'registerSound');
    }
    
    /**
     * Register an audio object
     */
    registerAudio(id: string, audio: IAudio): void {
        this.audioObjects.set(id, audio);
        
        logDebug('AudioManager', 'Audio object registered', {
            audioId: id,
            totalAudioObjects: this.audioObjects.size
        }, 'registerAudio');
    }
    
    /**
     * Unregister a sound
     */
    unregisterSound(id: string): boolean {
        const removed = this.sounds.delete(id);
        
        // Remove from all groups
        for (const [group, sounds] of this.soundGroups) {
            sounds.delete(id);
            if (sounds.size === 0) {
                this.soundGroups.delete(group);
            }
        }
        
        if (removed) {
            logDebug('AudioManager', 'Sound unregistered', {
                soundId: id,
                remainingSounds: this.sounds.size
            }, 'unregisterSound');
        }
        
        return removed;
    }
    
    /**
     * Unregister an audio object
     */
    unregisterAudio(id: string): boolean {
        const removed = this.audioObjects.delete(id);
        
        if (removed) {
            logDebug('AudioManager', 'Audio object unregistered', {
                audioId: id,
                remainingAudioObjects: this.audioObjects.size
            }, 'unregisterAudio');
        }
        
        return removed;
    }
    
    /**
     * Play a sound by ID
     */
    playSound(id: string, config?: any): boolean {
        const sound = this.sounds.get(id);
        
        if (!sound) {
            logWarn('AudioManager', 'Sound not found', {
                soundId: id,
                availableSounds: Array.from(this.sounds.keys())
            }, 'playSound');
            return false;
        }
        
        try {
            sound.playSound(id, config);
            
            logDebug('AudioManager', 'Sound played', {
                soundId: id,
                config
            }, 'playSound');
            
            return true;
        } catch (error) {
            logError('AudioManager', 'Error playing sound', {
                soundId: id,
                error
            }, 'playSound');
            return false;
        }
    }
    
    /**
     * Stop a sound by ID
     */
    stopSound(id: string): boolean {
        const sound = this.sounds.get(id);
        
        if (!sound) {
            return false;
        }
        
        try {
            sound.stopSound();
            
            logDebug('AudioManager', 'Sound stopped', {
                soundId: id
            }, 'stopSound');
            
            return true;
        } catch (error) {
            logError('AudioManager', 'Error stopping sound', {
                soundId: id,
                error
            }, 'stopSound');
            return false;
        }
    }
    
    /**
     * Stop all sounds
     */
    stopAllSounds(): void {
        logInfo('AudioManager', 'Stopping all sounds', {
            soundCount: this.sounds.size
        }, 'stopAllSounds');
        
        for (const [id, sound] of this.sounds) {
            try {
                sound.stopSound();
            } catch (error) {
                logError('AudioManager', 'Error stopping sound', {
                    soundId: id,
                    error
                }, 'stopAllSounds');
            }
        }
    }
    
    /**
     * Set global volume
     */
    setGlobalVolume(volume: number): void {
        this.globalVolume = Math.max(0, Math.min(1, volume));
        
        // Apply to all audio objects
        for (const audio of this.audioObjects.values()) {
            try {
                audio.setVolume(this.globalVolume);
            } catch (error) {
                logError('AudioManager', 'Error setting volume on audio object', {
                    error
                }, 'setGlobalVolume');
            }
        }
        
        logInfo('AudioManager', 'Global volume updated', {
            volume: this.globalVolume
        }, 'setGlobalVolume');
    }
    
    /**
     * Set global mute state
     */
    setGlobalMute(mute: boolean): void {
        this.globalMute = mute;
        
        // Apply to all audio objects
        for (const audio of this.audioObjects.values()) {
            try {
                audio.setMute(mute);
            } catch (error) {
                logError('AudioManager', 'Error setting mute on audio object', {
                    error
                }, 'setGlobalMute');
            }
        }
        
        logInfo('AudioManager', 'Global mute state updated', {
            mute: this.globalMute
        }, 'setGlobalMute');
    }
    
    /**
     * Play sounds in a group
     */
    playGroup(group: string, config?: any): void {
        const groupSounds = this.soundGroups.get(group);
        
        if (!groupSounds) {
            logWarn('AudioManager', 'Sound group not found', {
                group,
                availableGroups: Array.from(this.soundGroups.keys())
            }, 'playGroup');
            return;
        }
        
        logInfo('AudioManager', 'Playing sound group', {
            group,
            soundCount: groupSounds.size
        }, 'playGroup');
        
        for (const soundId of groupSounds) {
            this.playSound(soundId, config);
        }
    }
    
    /**
     * Stop sounds in a group
     */
    stopGroup(group: string): void {
        const groupSounds = this.soundGroups.get(group);
        
        if (!groupSounds) {
            return;
        }
        
        logInfo('AudioManager', 'Stopping sound group', {
            group,
            soundCount: groupSounds.size
        }, 'stopGroup');
        
        for (const soundId of groupSounds) {
            this.stopSound(soundId);
        }
    }
    
    /**
     * Fade in all audio objects
     */
    fadeInAll(duration: number): void {
        logInfo('AudioManager', 'Fading in all audio', {
            duration,
            audioCount: this.audioObjects.size
        }, 'fadeInAll');
        
        for (const audio of this.audioObjects.values()) {
            try {
                audio.fadeIn(duration);
            } catch (error) {
                logError('AudioManager', 'Error fading in audio object', {
                    error
                }, 'fadeInAll');
            }
        }
    }
    
    /**
     * Fade out all audio objects
     */
    fadeOutAll(duration: number): void {
        logInfo('AudioManager', 'Fading out all audio', {
            duration,
            audioCount: this.audioObjects.size
        }, 'fadeOutAll');
        
        for (const audio of this.audioObjects.values()) {
            try {
                audio.fadeOut(duration);
            } catch (error) {
                logError('AudioManager', 'Error fading out audio object', {
                    error
                }, 'fadeOutAll');
            }
        }
    }
    
    /**
     * Get sound by ID
     */
    getSound(id: string): ISound | null {
        return this.sounds.get(id) || null;
    }
    
    /**
     * Get audio object by ID
     */
    getAudio(id: string): IAudio | null {
        return this.audioObjects.get(id) || null;
    }
    
    /**
     * Get all sound groups
     */
    getSoundGroups(): string[] {
        return Array.from(this.soundGroups.keys());
    }
    
    /**
     * Get sounds in a group
     */
    getGroupSounds(group: string): string[] {
        const groupSounds = this.soundGroups.get(group);
        return groupSounds ? Array.from(groupSounds) : [];
    }
    
    /**
     * Get audio statistics
     */
    getStats(): {
        totalSounds: number;
        totalAudioObjects: number;
        totalGroups: number;
        globalVolume: number;
        globalMute: boolean;
    } {
        return {
            totalSounds: this.sounds.size,
            totalAudioObjects: this.audioObjects.size,
            totalGroups: this.soundGroups.size,
            globalVolume: this.globalVolume,
            globalMute: this.globalMute
        };
    }
    
    /**
     * Clear all registered sounds and audio objects
     */
    clear(): void {
        logInfo('AudioManager', 'Clearing all audio data', {
            soundCount: this.sounds.size,
            audioCount: this.audioObjects.size,
            groupCount: this.soundGroups.size
        }, 'clear');
        
        this.sounds.clear();
        this.audioObjects.clear();
        this.soundGroups.clear();
    }
}
