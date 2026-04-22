import type { Transition } from 'framer-motion'
import type { ChatMessage } from './type'

export function subPlanModifier(plan?: string): 'tier-1' | 'tier-2' | 'tier-3' | 'tier-prime' {
  if (plan === '2000') return 'tier-2'
  if (plan === '3000') return 'tier-3'
  if (plan === 'Prime') return 'tier-prime'
  return 'tier-1'
}

type MotionProps = {
  initial: Record<string, number | number[]>
  animate: Record<string, number | number[]>
  exit: Record<string, number>
  transition: Transition
}

const defaultMotion: MotionProps = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 },
}

const tier3Motion: MotionProps = {
  initial: { opacity: 0, y: -10, scale: 0.9, rotate: -1 },
  animate: { opacity: 1, y: 0, scale: [0.9, 1.06, 1], rotate: 0 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.55, ease: [0.22, 1.2, 0.36, 1], times: [0, 0.6, 1] },
}

export function eventMotionProps(msg: ChatMessage): MotionProps {
  const isTier3Sub =
    (msg.type === 'subscription' || msg.type === 'resub') && msg.subPlan === '3000'
  return isTier3Sub ? tier3Motion : defaultMotion
}
