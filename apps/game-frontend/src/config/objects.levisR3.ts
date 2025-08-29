import type { ObjectsConfig } from '../objects/types';

export const LevisR3Objects: ObjectsConfig = [
    {
        type: 'container', id: 'bg', z: 0, x: 0, y: 0, children: [
            // runtime texture created in scene via ensureBasicTextures()
            { type: 'image', id: 'bg-img', x: 0, y: 0, props: { key: 'bg-red', origin: [0, 0] } }
        ]
    },

    { type: 'container', id: 'fx-back', z: 10, x: 0, y: 0, children: [] },
    { type: 'container', id: 'fx-front', z: 90, x: 0, y: 0, children: [] },

    {
        type: 'container', id: 'wheel-root', z: 50, x: 0, y: 0,
        // group-level input (optional)
        hitArea: { kind: 'rect', width: 600, height: 600, originCenter: true },
        interactive: true, cursor: 'pointer',
        children: []
    },

    {
        type: 'container', id: 'ui', z: 100, x: 0, y: 0, children: [
            {
                type: 'text', id: 'title', z: 101, x: -520, y: -260,
                props: {
                    text: 'HAPPY MID AUTUMN FESTIVAL',
                    style: { fontFamily: 'Arial', fontSize: '56px', color: '#FFE8C9', fontStyle: 'bold' },
                    origin: [0.5, 0.5]
                }
            }
        ]
    },

    {
        type: 'container', id: 'modal', z: 1000, x: 0, y: 0, visible: false,
        hitArea: { kind: 'rect', width: 1440, height: 810, originCenter: true },
        interactive: true,
        children: []
    },

    {
        type: 'container', id: 'brand', z: 110, x: 0, y: 0, children: [
            {
                type: 'text', id: 'logo', z: 111, x: 0, y: -470,
                props: { text: 'Levi’s®', style: { fontSize: '36px', color: '#ffffff' }, origin: [0.5, 0.5] }
            }
        ]
    },
];
