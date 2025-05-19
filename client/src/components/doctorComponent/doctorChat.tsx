'use client';
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { IMessage, IPatient } from '@/type/patient';
import { sendMessage, getConversation, getUnredMessageCount, getMessageMark } from '@/lib/api/doctor/doctor';
import { useParams } from 'next/navigation';
import { getPatientByDoctors } from '@/lib/api/doctor/doctor';

const Chat: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<IPatient | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const currentUserId = params?.id as string;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getPatientByDoctors();
      const patientsWithCounts = await Promise.all(
        (response?.data.data || []).map(async (patient: IPatient) => {
          const count = await getUnredMessageCount(patient._id);
          return { ...patient, unreadCount: count || 0 };
        })
      );
      setPatients(patientsWithCounts);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPatients();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000/api', {
      withCredentials: true,
    });

    newSocket.emit('join', currentUserId);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: IMessage) => {
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg) => msg._id === message._id);
        if (messageExists) return prevMessages;
        return [...prevMessages, message];
      });

      if (message.senderId !== currentUserId) {
        if (selectedUser?._id === message.senderId) {
          // Mark as read if viewing the conversation
          socket.emit('markAsRead', { userId: currentUserId, senderId: message.senderId });
        } else {
          // Increment unread count for non-selected user
          setPatients((prevPatients) =>
            prevPatients.map((patient) =>
              patient._id === message.senderId
                ? { ...patient, unreadCount: (patient.unreadCount || 0) + 1 }
                : patient
            )
          );
        }
      }
    };

    const handleMessagesRead = (data: { senderId: string; unreadCount: number }) => {
      setPatients((prevPatients) =>
        prevPatients.map((patient) =>
          patient._id === data.senderId ? { ...patient, unreadCount: data.unreadCount } : patient
        )
      );
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === data.senderId && !msg.isRead ? { ...msg, isRead: true } : msg
        )
      );
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messagesRead', handleMessagesRead);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [socket, currentUserId, selectedUser]);

  const markMessagesAsRead = async (senderId: string) => {
    try {
      await getMessageMark(senderId);
      socket?.emit('markAsRead', { userId: currentUserId, senderId });
      setPatients((prev) =>
        prev.map((patient) => (patient._id === senderId ? { ...patient, unreadCount: 0 } : patient))
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
      setError('Failed to mark messages as read');
    }
  };

  useEffect(() => {
    if (!selectedUser) return;

    const loadConversation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const conversation = await getConversation(selectedUser._id);
        setMessages(conversation.data || []);
        await markMessagesAsRead(selectedUser._id);
      } catch (error) {
        console.error('Error loading conversation:', error);
        setError('Failed to load conversation');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectUser = async (patient: IPatient) => {
    setSelectedUser(patient);
    await markMessagesAsRead(patient._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || isSending) return;

    try {
      setIsSending(true);
      setError(null);
      const messageData = {
        receiverId: selectedUser._id,
        message: newMessage,
        isRead: false,
        createdAt: new Date().toISOString(),
        senderId: currentUserId,
      };

      const tempId = Date.now().toString();
      setMessages((prev) => [...prev, { ...messageData, _id: tempId }]);

      const response = await sendMessage(messageData);
      setMessages((prev) => prev.map((msg) => (msg._id === tempId ? response.data : msg)));

      socket?.emit('sendMessage', response.data);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[600px] ml-[8%] mr-[8%] border border-gray-200 rounded-lg shadow-sm bg-white">
      <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
        <h2 className="text-xl font-semibold p-4 border-b border-gray-200">Patients</h2>
        {error && <div className="p-4 text-red-500">{error}</div>}
        {isLoading ? (
          <div className="p-4 text-center">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No patients available</div>
        ) : (
          patients.map((patient) => (
            <div
              key={patient._id}
              className={`flex items-center p-3 border-b border-gray-100 cursor-pointer hover:bg-teal-50 relative ${
                selectedUser?._id === patient._id ? 'bg-teal-100' : ''
              }`}
              onClick={() => handleSelectUser(patient)}
            >
              {patient.profileImage && (
                <img
                  src={patient.profileImage}
                  alt={patient.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{patient.name}</p>
                {patient.email && <p className="text-xs text-gray-500">{patient.email}</p>}
              </div>
              {patient.unreadCount && patient.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {patient.unreadCount}
                </span>
              )}
            </div>
          ))
        )}
      </div>
      <div className="w-3/4 flex flex-col justify-between">
        <div className="flex items-center p-4 border-b border-gray-200 bg-white">
          {selectedUser?.profileImage && (
            <img
              src={selectedUser.profileImage}
              alt={selectedUser.name}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
          )}
          <span className="font-medium text-lg">{selectedUser?.name || 'Select a patient to chat'}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {isLoading ? (
            <div className="text-center text-gray-500 mt-10">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              {selectedUser ? 'No messages yet. Start the conversation!' : 'Select a patient to view conversation'}
            </div>
          ) : (
            messages
              .sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime())
              .map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg text-sm max-w-[80%] ${
                      msg.senderId === currentUserId
                        ? 'bg-teal-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {msg.message}
                    <div
                      className={`text-xs mt-1 opacity-70 flex ${
                        msg.senderId === currentUserId ? 'justify-between' : 'justify-end'
                      } items-center`}
                    >
                      <span>
                        {new Date(msg.createdAt || '').toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {msg.senderId === currentUserId && (
                          <span className="ml-1">
                            {msg.isRead ? (
                              <span className="text-blue-300">✓✓</span>
                            ) : (
                              <span className="text-gray-300">✓</span>
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center p-4 border-t border-gray-400 bg-white">
          <input
            type="text"
            className="flex-1 border border-gray-400 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Write a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!selectedUser || isSending}
          />
          <button
            onClick={handleSendMessage}
            className="ml-2 bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition disabled:opacity-50"
            disabled={!selectedUser || !newMessage.trim() || isSending}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;