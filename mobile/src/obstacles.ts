import AsyncStorage from '@react-native-async-storage/async-storage';
import { Obstacle } from './types';

const KEY = 'librevoie.obstacles.v1';

export async function getObstacles(): Promise<Obstacle[]> {
  return JSON.parse((await AsyncStorage.getItem(KEY)) ?? '[]');
}

export async function addObstacle(obstacle: Obstacle) {
  const current = await getObstacles();
  await AsyncStorage.setItem(KEY, JSON.stringify([obstacle, ...current].slice(0, 100)));
}

