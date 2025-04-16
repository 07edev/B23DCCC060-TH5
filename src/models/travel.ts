import { Effect, ImmerReducer } from 'umi';

export enum DestinationType {
  BEACH = 'beach',
  MOUNTAIN = 'mountain',
  CITY = 'city',
}

export interface Destination {
  id: string;
  name: string;
  image: string;
  type: DestinationType;
  price: number;
  rating: number;
  description: string;
}

export interface TripItem {
  id: string;
  destinationId: string;
  date: string;
  order: number;
}

export interface Budget {
  food: number;
  accommodation: number;
  transportation: number;
  activities: number;
  other: number;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  items: TripItem[];
  budget: Budget;
}

export interface TravelModelState {
  destinations: Destination[];
  trips: Trip[];
  loading: boolean;
  currentTrip: Trip | null;
}

export interface TravelModelType {
  namespace: 'travel';
  state: TravelModelState;
  effects: {
    fetchDestinations: Effect;
    fetchTrips: Effect;
    saveTrip: Effect;
    deleteTrip: Effect;
  };
  reducers: {
    setDestinations: ImmerReducer<TravelModelState>;
    setTrips: ImmerReducer<TravelModelState>;
    setCurrentTrip: ImmerReducer<TravelModelState>;
    updateCurrentTrip: ImmerReducer<TravelModelState>;
    setLoading: ImmerReducer<TravelModelState>;
    removeTrip: ImmerReducer<TravelModelState>;
  };
}

// Mock data
const mockDestinations: Destination[] = [
  {
    id: '1',
    name: 'Vịnh Hạ Long',
    image: '/destinations/halong.jpg',
    type: DestinationType.BEACH,
    price: 1500000,
    rating: 4.8,
    description: 'Kỳ quan thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi và vùng nước xanh ngọc bích.'
  },
  {
    id: '2',
    name: 'Ruộng bậc thang Sapa',
    image: '/destinations/sapa.jpg',
    type: DestinationType.MOUNTAIN,
    price: 1200000,
    rating: 4.7,
    description: 'Thị trấn miền núi nổi tiếng với ruộng bậc thang tuyệt đẹp và văn hóa của các dân tộc thiểu số.'
  },
  {
    id: '3',
    name: 'Đà Lạt',
    image: '/destinations/dalat.jpg',
    type: DestinationType.MOUNTAIN,
    price: 1100000,
    rating: 4.6,
    description: 'Thành phố ngàn hoa với khí hậu mát mẻ quanh năm, kiến trúc Pháp và nhiều cảnh quan thiên nhiên đẹp.'
  },
  {
    id: '4',
    name: 'Phố cổ Hội An',
    image: '/destinations/hoian.jpg',
    type: DestinationType.CITY,
    price: 1300000,
    rating: 4.9,
    description: 'Phố cổ lãng mạn với những ngôi nhà được bảo tồn tốt, đèn lồng đầy màu sắc và dòng sông Thu Bồn thơ mộng.'
  },
  {
    id: '5',
    name: 'Biển Nha Trang',
    image: '/destinations/nhatrang.jpg',
    type: DestinationType.BEACH,
    price: 1600000,
    rating: 4.5,
    description: 'Thành phố biển nổi tiếng với bãi biển cát trắng, nước trong xanh và nhiều hoạt động giải trí hấp dẫn.'
  },
  {
    id: '6',
    name: 'Thành phố Hồ Chí Minh',
    image: '/destinations/hochiminh.jpg',
    type: DestinationType.CITY,
    price: 2000000,
    rating: 4.5,
    description: 'Thành phố năng động nhất Việt Nam với nhiều địa điểm du lịch lịch sử, ẩm thực phong phú và cuộc sống về đêm sôi động.'
  }
];

const travelModel: TravelModelType = {
  namespace: 'travel',
  
  state: {
    destinations: mockDestinations,
    trips: [],
    loading: false,
    currentTrip: null,
  },

  effects: {
    *fetchDestinations(_, { put }) {
      yield put({ type: 'setLoading', payload: true });
      // In a real app, we would fetch from API
      yield put({ type: 'setDestinations', payload: mockDestinations });
      yield put({ type: 'setLoading', payload: false });
    },
    
    *fetchTrips(_, { put, select }) {
      yield put({ type: 'setLoading', payload: true });
      
      // Trong ứng dụng thực tế, sẽ lấy dữ liệu từ API
      // Hiện tại chỉ lấy từ localStorage nếu có
      try {
        const savedTrips = localStorage.getItem('travel_trips');
        console.log('Fetched from localStorage:', savedTrips);
        
        if (savedTrips) {
          const trips = JSON.parse(savedTrips);
          console.log('Parsed trips from localStorage:', trips);
          
          // Kiểm tra tính hợp lệ của dữ liệu
          const validTrips = trips.filter(trip => {
            // Kiểm tra xem trip có đúng cấu trúc không
            if (!trip || !trip.id || !Array.isArray(trip.items)) {
              console.warn('Found invalid trip:', trip);
              return false;
            }
            return true;
          });
          
          if (validTrips.length !== trips.length) {
            console.warn(`Filtered out ${trips.length - validTrips.length} invalid trips`);
          }
          
          console.log('Setting valid trips to state:', validTrips);
          yield put({ type: 'setTrips', payload: validTrips });
        } else {
          console.log('No saved trips found in localStorage');
        }
      } catch (error) {
        console.error('Error loading trips:', error);
      }
      
      yield put({ type: 'setLoading', payload: false });
    },
    
    *saveTrip({ payload }, { put, select }) {
      yield put({ type: 'setLoading', payload: true });
      
      const { trips } = yield select((state: any) => state.travel);
      
      console.log('Saving trip with ID:', payload.id);
      console.log('Trip data:', payload);
      console.log('Current trips in store:', trips);
      
      // Check if trip exists
      const existingTripIndex = trips.findIndex((t: Trip) => t.id === payload.id);
      console.log('Existing trip index:', existingTripIndex);
      
      let updatedTrips;
      if (existingTripIndex >= 0) {
        updatedTrips = [...trips];
        updatedTrips[existingTripIndex] = payload;
        console.log('Updated existing trip');
      } else {
        updatedTrips = [...trips, payload];
        console.log('Added new trip');
      }
      
      // Lưu vào localStorage
      try {
        localStorage.setItem('travel_trips', JSON.stringify(updatedTrips));
        console.log('Saved to localStorage successfully');
        // Kiểm tra xem đã lưu thành công chưa
        const savedData = localStorage.getItem('travel_trips');
        const parsedData = savedData ? JSON.parse(savedData) : [];
        console.log('Trips from localStorage after save:', parsedData);
      } catch (error) {
        console.error('Error saving trips:', error);
      }
      
      yield put({ type: 'setTrips', payload: updatedTrips });
      yield put({ type: 'setLoading', payload: false });
    },
    
    *deleteTrip({ payload }, { put, select }) {
      yield put({ type: 'setLoading', payload: true });
      
      const { trips } = yield select((state: any) => state.travel);
      const updatedTrips = trips.filter((trip: Trip) => trip.id !== payload);
      
      // Cập nhật localStorage
      try {
        localStorage.setItem('travel_trips', JSON.stringify(updatedTrips));
      } catch (error) {
        console.error('Error saving trips after deletion:', error);
      }
      
      yield put({ type: 'setTrips', payload: updatedTrips });
      yield put({ type: 'setLoading', payload: false });
    }
  },

  reducers: {
    setDestinations(state, { payload }) {
      state.destinations = payload;
      return state;
    },
    setTrips(state, { payload }) {
      state.trips = payload;
      return state;
    },
    setCurrentTrip(state, { payload }) {
      state.currentTrip = payload;
      return state;
    },
    updateCurrentTrip(state, { payload }) {
      if (state.currentTrip) {
        state.currentTrip = {
          ...state.currentTrip,
          ...payload,
        };
      }
      return state;
    },
    removeTrip(state, { payload }) {
      state.trips = state.trips.filter(trip => trip.id !== payload);
      return state;
    },
    setLoading(state, { payload }) {
      state.loading = payload;
      return state;
    },
  },
};

export default travelModel; 