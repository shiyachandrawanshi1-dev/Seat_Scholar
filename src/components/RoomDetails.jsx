import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DoorOpen, Plus, Trash2 } from 'lucide-react';

export default function RoomDetails() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRoom, setNewRoom] = useState({
    room_no: '', block: '', capacity: 0, bench_type: 'Double', rows: 0, cols: 0
  });

  
  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/rooms/');
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Rooms load nahi ho paye:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  
  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/rooms/', newRoom);
      setNewRoom({ room_no: '', block: '', capacity: 0, bench_type: 'Double', rows: 0, cols: 0 });
      fetchRooms();
    } catch (error) {
      alert("Error saving room! Check backend.");
    }
  };

  
  const handleDelete = async (id) => {
    if (window.confirm("Delete this room?")) {
      await axios.delete(`http://127.0.0.1:8000/api/rooms/${id}/`);
      fetchRooms();
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
        <DoorOpen className="text-blue-600" /> Room Configuration
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Room Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <form onSubmit={handleAddRoom} className="space-y-4">
            <input type="text" placeholder="Room Number" className="w-full p-3 bg-slate-50 border rounded-xl" 
                   value={newRoom.room_no} onChange={e => setNewRoom({...newRoom, room_no: e.target.value})} required />
            
            <input type="text" placeholder="Block Name (e.g. Block A)" className="w-full p-3 bg-slate-50 border rounded-xl"
                   value={newRoom.block} onChange={e => setNewRoom({...newRoom, block: e.target.value})} required />
            
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Rows" className="p-3 bg-slate-50 border rounded-xl"
                     onChange={e => setNewRoom({...newRoom, rows: e.target.value})} />
              <input type="number" placeholder="Cols" className="p-3 bg-slate-50 border rounded-xl"
                     onChange={e => setNewRoom({...newRoom, cols: e.target.value})} />
            </div>

            <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Save Room</button>
          </form>
        </div>

        {/* Room List */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? <p>Loading Rooms...</p> : rooms.map(room => (
            <div key={room.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Room {room.room_no}</h3>
                <p className="text-sm text-slate-500">{room.block} | Capacity: {room.rows * room.cols}</p>
              </div>
              <button onClick={() => handleDelete(room.id)} className="text-red-400 hover:text-red-600"><Trash2 size={20}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}