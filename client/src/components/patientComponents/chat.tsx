'use client';
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { IDoctor, IMessage } from '@/type/patient';
import { getDoctorByPatient, sendMessage, getConversation, getUnredMessageCount, getMessageMark } from '@/lib/api/patient/patient';
import { usePatient } from '@/context/authContext';

const Chat: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<IDoctor | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const  {patientData}  = usePatient();
  const currentUserId = patientData?._id

  const getDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getDoctorByPatient();
      const doctorsWithCounts = await Promise.all(
        (response?.data.data || []).map(async (doctor: IDoctor) => {
          const count = await getUnredMessageCount(doctor._id);
          return { ...doctor, unreadCount: count || 0 };
        })
      );
      setDoctors(doctorsWithCounts);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDoctors();
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
          socket.emit('markAsRead', { userId: currentUserId, senderId: message.senderId });
        } else {
          setDoctors((prevDoctors) =>
            prevDoctors.map((doctor) =>
              doctor._id === message.senderId
                ? { ...doctor, unreadCount: (doctor.unreadCount || 0) + 1 }
                : doctor
            )
          );
        }
      }
    };

    const handleMessagesRead = (data: { senderId: string; unreadCount: number }) => {
      setDoctors((prevDoctors) =>
        prevDoctors.map((doctor) =>
          doctor._id === data.senderId ? { ...doctor, unreadCount: data.unreadCount } : doctor
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
      setDoctors((prev) =>
        prev.map((doctor) => (doctor._id === senderId ? { ...doctor, unreadCount: 0 } : doctor))
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

  

  const handleSelectUser = async (doctor: IDoctor) => {
    setSelectedUser(doctor);
    await markMessagesAsRead(doctor._id);
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

  // useEffect(()=>{
  //      console.log("current",currentUserId)
  //     console.log("sender",messages)
  // })

  return (
    <div className="flex h-[600px] ml-[8%] mr-[8%] border border-gray-200 rounded-lg shadow-sm bg-white">
      <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
        <h2 className="text-xl font-semibold p-4 border-b border-gray-200">Doctors</h2>
        {error && <div className="p-4 text-red-500">{error}</div>}
        {isLoading ? (
          <div className="p-4 text-center">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No doctors available</div>
        ) : (
          doctors.map((doctor) => (
            <div
              key={doctor._id}
              className={`flex items-center p-3 border-b border-gray-100 cursor-pointer hover:bg-teal-50 relative ${
                selectedUser?._id === doctor._id ? 'bg-teal-100' : ''
              }`}
              onClick={() => handleSelectUser(doctor)}
            >
              {doctor.profileImg && (
                <img
                  src={doctor.profileImg}
                  alt={doctor.fullName}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{doctor.fullName}</p>
                {doctor.specialization && (
                  <p className="text-xs text-gray-500">{doctor.specialization}</p>
                )}
              </div>
              {doctor.unreadCount && doctor.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {doctor.unreadCount}
                </span>
              )}
            </div>
          ))
        )}
      </div>
      <div className="w-3/4 flex flex-col justify-between">
        <div className="flex items-center p-4 border-b border-gray-200 bg-white">
          {selectedUser?.profileImg && (
            <img
              src={selectedUser.profileImg}
              alt={selectedUser.fullName}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
          )}
          <span className="font-medium text-lg">
            {selectedUser?.fullName || 'Select a doctor to chat'}
          </span>
        </div>
              {/* Messages area - THIS IS THE CRITICAL FIX */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {isLoading ? (
            <div className="text-center text-gray-500 mt-10">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              {selectedUser ? 'No messages yet. Start the conversation!' : 'Select a doctor to view conversation'}
            </div>
          ) : (
            messages
              .sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime())
              .map((msg) => {
                const isCurrentUser = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg text-sm max-w-[80%] ${
                        isCurrentUser
                          ? 'bg-teal-600 text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {msg.message}
                      <div
                        className={`text-xs mt-1 opacity-70 flex ${
                          isCurrentUser ? 'justify-between' : 'justify-end'
                        } items-center`}
                      >
                        <span>
                          {new Date(msg.createdAt || '').toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {isCurrentUser && (
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
                );
              })
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