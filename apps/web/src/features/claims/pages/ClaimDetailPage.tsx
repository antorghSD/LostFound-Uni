import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { api, type Claim, type ClaimMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { connectSocket } from '@/lib/socket';

export default function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const qc = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['claim-messages', id],
    queryFn: async () => {
      const { data } = await api.get(`/claims/${id}/messages`);
      return data.data as ClaimMessage[];
    },
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/claims/${id}/messages`, { message });
    },
    onSuccess: () => {
      setMessage('');
      qc.invalidateQueries({ queryKey: ['claim-messages', id] });
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to send'),
  });

  // Socket real-time
  useEffect(() => {
    const socket = connectSocket();
    socket.on('chat:message', (msg: ClaimMessage) => {
      if (msg.claimId === id) {
        qc.invalidateQueries({ queryKey: ['claim-messages', id] });
      }
    });
    return () => {
      socket.off('chat:message');
    };
  }, [id, qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="container py-6">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => nav(-1)}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-xl border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Chat</h2>
            <p className="text-xs text-muted-foreground">Claim #{id?.slice(-8)}</p>
          </div>

          <div className="max-h-[60vh] min-h-[300px] space-y-3 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-uiu-orange" />
              </div>
            ) : messages?.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No messages yet. Start the conversation.
              </p>
            ) : (
              messages?.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        isMe
                          ? 'bg-uiu-orange text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p
                        className={`mt-1 text-xs ${
                          isMe ? 'text-white/70' : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && message && sendMutation.mutate()}
                placeholder="Type a message..."
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
              />
              <button
                onClick={() => sendMutation.mutate()}
                disabled={!message || sendMutation.isPending}
                className="rounded-md bg-uiu-orange px-4 text-white hover:bg-uiu-orange-dark disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}