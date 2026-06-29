import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wifi, Tv, Coffee, Wind } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCachedData, setCachedData } from '../utils/cache';

const Apartments = () => {
  const cachedRooms = getCachedData('rooms');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!cachedRooms);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase.from('rooms').select('id, name, type, capacity, size_sqm, base_price_ngn, image_url, status, amenities').order('name');
      if (data) {
        // Group by room type for 96 rooms
        const getLocalImageForRoom = (type) => {
          if (type.toLowerCase().includes('diamond')) return '/Images/Diamond rooms.png';
          if (type.toLowerCase().includes('executive') || type.toLowerCase().includes('suite')) return '/Images/Executive Suites.png';
          return '/Images/First Room.png';
        };

        const grouped = data.reduce((acc, room) => {
          if (!acc[room.type]) {
            acc[room.type] = {
              type: room.type,
              count: 0,
              base_price: room.base_price_ngn,
              capacity: room.capacity,
              size_sqm: room.size_sqm,
              image_url: getLocalImageForRoom(room.type), 
              sampleId: room.id,
              amenities: room.amenities || ['Free Wi-Fi', 'Smart TV', 'Room Service']
            };
          }
          acc[room.type].count++;
          if (room.base_price_ngn < acc[room.type].base_price) {
            acc[room.type].base_price = room.base_price_ngn;
          }
          return acc;
        }, {});
        
        const categoriesArray = Object.values(grouped);
        setCategories(categoriesArray);
        setCachedData('rooms', data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (idx) => {
    const icons = [<Wifi size={16} />, <Tv size={16} />, <Coffee size={16} />, <Wind size={16} />];
    return icons[idx % icons.length];
  };

  return (
    <div className="pt-24 min-h-screen bg-dark-900 w-full text-white pb-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 pt-10">
          <h4 className="text-gold-500 font-medium tracking-widest uppercase mb-4">Our Portfolio</h4>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">All Residences</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Explore our curated collection of premium suites and rooms. Discover the perfect accommodation for your stay.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto mb-4"></div>
            Loading residences...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div key={index} className="bg-dark-800 border border-dark-700 group overflow-hidden flex flex-col h-full rounded-lg shadow-lg hover:shadow-gold-500/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-72 overflow-hidden">
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.type} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-dark-900 to-black text-center p-4">
                      <span className="text-gold-500 font-serif text-base tracking-widest uppercase">{category.type}</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-dark-900/90 backdrop-blur-md px-4 py-2 text-gold-500 font-semibold border border-dark-700 rounded-sm shadow-xl">
                    From ₦{Number(category.base_price).toLocaleString()} <span className="text-sm text-gray-400 font-normal">/ night</span>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-dark-900 to-transparent h-24"></div>
                  <div className="absolute bottom-4 left-4">
                     <span className="bg-brand-600/90 text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider backdrop-blur-sm">
                        {category.count} Rooms in this category
                     </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-semibold mb-2 group-hover:text-gold-500 transition-colors text-white">{category.type}</h3>
                  <div className="flex gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-dark-700">
                    <span>Up to {category.capacity} Guests</span>
                    <span>•</span>
                    <span>{category.size_sqm} sqm</span>
                  </div>
                  
                  <div className="flex-grow mb-6">
                    <p className="text-sm text-gray-400 mb-4 font-medium tracking-wide uppercase">Featured Amenities:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {category.amenities.slice(0, 4).map((amenity, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                           <span className="text-gold-500">{getAmenityIcon(i)}</span>
                           <span className="truncate">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-auto">
                    <Link to={`/room/${category.sampleId}`} className="btn-outline flex-1 text-center py-3 text-white border-dark-600 hover:bg-dark-700 hover:border-gold-500 transition-colors">
                      Explore Type
                    </Link>
                    <Link to={`/booking?type=${encodeURIComponent(category.type)}`} className="bg-gold-500 hover:bg-gold-400 text-dark-900 font-semibold flex-1 text-center py-3 rounded-md flex justify-center items-center gap-2 transition-colors">
                      Book Now <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Apartments;

