import MainChat from '@/app/chat/components/mainChat'

export default function Chat() {
  return (
    <div className='flex h-screen items-center'>
      <div className='flex gap-5'>
        <MainChat />
      </div>
    </div>
  )
}
