import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, localhost } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [hardhat, localhost],
  ssr: true,
});
