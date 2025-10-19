import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {  somniaTestnet } from 'wagmi/chains'   // ✅ Fuji testnet chain from wagmi

// Your WalletConnect / AppKit Project ID
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID // <-- replace with your real projectId from WalletConnect/AppKit
console.log(projectId)
if (!projectId) {
  throw new Error('Project ID is not defined')
}

// ✅ use Avalanche Fuji chain
export const network = somniaTestnet

// Build wagmi adapter config
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  networks: [network],   // Fuji testnet
  projectId,
})

// Token configuration
export const TOKEN_SYMBOL = 'STT' // Change this to your desired token symbol

// Export wagmi config
export const config = wagmiAdapter.wagmiConfig
