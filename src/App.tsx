/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { 
  ConnectWallet, 
  Wallet, 
  WalletDropdown, 
  WalletDropdownDisconnect, 
  WalletDropdownLink 
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { useAccount, useSendTransaction } from 'wagmi';
import { stringToHex } from 'viem';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  History, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function App() {
  const { address, isConnected } = useAccount();
  const { sendTransaction, isPending } = useSendTransaction();
  const [message, setMessage] = useState('');
  const [shoutouts, setShoutouts] = useState<{address: string, message: string, timestamp: number}[]>([]);
  const [lastCheckIn, setLastCheckIn] = useState<number>(() => {
    const saved = localStorage.getItem(`lastCheckIn_${address}`);
    return saved ? parseInt(saved) : 0;
  });

  const canCheckIn = !lastCheckIn || Date.now() - lastCheckIn > 24 * 60 * 60 * 1000;

  const handleSendShoutout = useCallback(() => {
    if (!message || !address) return;

    sendTransaction({
      to: address as `0x${string}`,
      value: BigInt(0),
      data: stringToHex(`SHOUTOUT:${message}`),
    }, {
      onSuccess: () => {
        setShoutouts(prev => [{
          address,
          message,
          timestamp: Date.now()
        }, ...prev]);
        setMessage('');
      }
    });
  }, [message, address, sendTransaction]);

  const handleCheckIn = useCallback(() => {
    if (!address) return;

    sendTransaction({
      to: address as `0x${string}`,
      value: BigInt(0),
      data: stringToHex('DAILY_CHECK_IN'),
    }, {
      onSuccess: () => {
        const now = Date.now();
        setLastCheckIn(now);
        localStorage.setItem(`lastCheckIn_${address}`, now.toString());
      }
    });
  }, [address, sendTransaction]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 flex justify-between items-center glass border-b-0 rounded-b-3xl mx-auto max-w-7xl mt-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">
            Base <span className="text-gradient">Shoutout</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Wallet>
            <ConnectWallet className="!bg-blue-600 hover:!bg-blue-700 !rounded-xl !transition-all !duration-300">
              <Avatar className="h-6 w-6" />
              <Name />
            </ConnectWallet>
            <WalletDropdown className="glass !border-white/10 !rounded-2xl !mt-2">
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address />
                <EthBalance />
              </Identity>
              <WalletDropdownLink icon="wallet" href="https://wallet.coinbase.com">
                Wallet
              </WalletDropdownLink>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Base Names & Smart Wallets</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter leading-tight">
            Leave Your Mark <br />
            <span className="text-gradient">On-Chain Forever.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Send free shoutouts and maintain your daily on-chain streak. 
            Only gas fees apply.
          </p>
        </motion.section>

        {/* Action Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Check-in Card */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-8 space-y-6 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="text-purple-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Daily Check-in</h3>
                <p className="text-gray-400 text-sm">Verify your presence on Base every 24 hours.</p>
              </div>
            </div>

            <div className="space-y-4">
              {lastCheckIn > 0 && (
                <div className="text-xs text-purple-400 font-mono bg-purple-400/10 p-3 rounded-xl border border-purple-400/20">
                  Last check-in: {new Date(lastCheckIn).toLocaleString()}
                </div>
              )}
              
              <button 
                onClick={handleCheckIn}
                disabled={!isConnected || !canCheckIn || isPending}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500 rounded-2xl font-bold transition-all shadow-lg shadow-purple-500/10 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : !canCheckIn ? (
                  "Checked in for today"
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Check-in Now
                  </>
                )}
              </button>
            </div>
          </motion.section>

          {/* Shoutout Card */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-8 space-y-6 relative overflow-hidden"
          >
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Shoutout
              </label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-base resize-none"
                maxLength={140}
              />
            </div>

            <button 
              onClick={handleSendShoutout}
              disabled={!isConnected || !message || isPending}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Shoutout
                </>
              )}
            </button>
          </motion.section>
        </div>

        {/* Recent Shoutouts */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <History className="w-6 h-6 text-blue-500" />
              Recent Shoutouts
            </h3>
          </div>

          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {shoutouts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-12 text-center text-gray-500"
                >
                  No shoutouts yet. Be the first!
                </motion.div>
              ) : (
                shoutouts.map((s, i) => (
                  <motion.div 
                    key={s.timestamp}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass glass-hover rounded-2xl p-6 flex items-start gap-4"
                  >
                    <div className="flex-shrink-0">
                      <Identity address={s.address as `0x${string}`} schemaId="0xf8b053e40e34190f7893962b95109b33327d2400115e3b283ddc61f9309e70c5">
                        <Avatar className="h-12 w-12 rounded-xl" />
                      </Identity>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <Identity address={s.address as `0x${string}`}>
                          <Name className="font-bold text-blue-400" />
                        </Identity>
                        <span className="text-xs text-gray-500">
                          {new Date(s.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-200 leading-relaxed">
                        {s.message}
                      </p>
                      <div className="pt-2 flex items-center gap-4">
                        <a 
                          href={`https://basescan.org/address/${s.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-gray-500 hover:text-blue-400 flex items-center gap-1 uppercase tracking-widest font-bold transition-colors"
                        >
                          View on Basescan <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center space-y-4">
        <div className="flex justify-center gap-6">
          <a href="#" className="text-gray-500 hover:text-white transition-colors">Twitter</a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">Discord</a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">Github</a>
        </div>
        <p className="text-gray-600 text-sm">
          Built with OnchainKit & Base. 2026.
        </p>
      </footer>
    </div>
  );
}
