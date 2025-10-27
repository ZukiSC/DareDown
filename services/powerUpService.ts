import { PowerUp, PowerUpType } from '../types';

const POWER_UPS: PowerUp[] = [
    {
        id: 'SKIP_DARE',
        name: 'Skip Dare',
        description: 'Use this to get out of doing a dare.',
        emoji: '🏃‍♂️',
    },
    {
        id: 'EXTRA_TIME',
        name: 'Extra Time',
        description: 'Adds 5 seconds to the timer in a mini-game.',
        emoji: '⏰',
    },
    {
        id: 'SWAP_CATEGORY',
        name: 'Swap Category',
        description: 'Change your preferred category for the next round.',
        emoji: '🔄',
    },
];

export const getPowerUpById = (id: PowerUpType): PowerUp | undefined => {
    return POWER_UPS.find(p => p.id === id);
}

export const getAllPowerUps = (): PowerUp[] => {
    return POWER_UPS;
}

export const getRandomPowerUp = (): PowerUp => {
    const randomIndex = Math.floor(Math.random() * POWER_UPS.length);
    return POWER_UPS[randomIndex];
}
