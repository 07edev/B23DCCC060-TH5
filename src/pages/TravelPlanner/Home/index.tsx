import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'umi';
import { Typography, Row, Col, Spin, Empty, BackTop, Card, Button, Tabs, Modal, Input, message } from 'antd';
import { UpOutlined, PlusOutlined, EditOutlined, DeleteOutlined, FormOutlined } from '@ant-design/icons';
import { Destination, DestinationType, Trip } from '@/models/travel';
import { history } from 'umi';
import DestinationCard from '@/components/TravelPlanner/DestinationCard';
import DestinationFilter from '@/components/TravelPlanner/DestinationFilter';
import moment from 'moment';
import { generateTripId } from '@/utils/travel';
import styles from './index.less';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface FilterValues {
  type?: DestinationType;
  priceRange: [number, number];
  rating?: number;
  sortBy?: string;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const { destinations = [], trips = [], loading = false } = useSelector((state: any) => state.travel || {});
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [filters, setFilters] = useState<FilterValues>({
    priceRange: [0, 3000000],
    sortBy: 'rating_desc',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [tripName, setTripName] = useState('');

  useEffect(() => {
    console.log('HomePage: Loading trips and destinations data');
    
    if (trips.length === 0) {
      console.log('No trips loaded yet, dispatching fetchTrips');
      dispatch({
        type: 'travel/fetchTrips',
      });
    } else {
      console.log('Trips already loaded:', trips.length, 'trips');
    }
    
    if (destinations.length === 0) {
      console.log('No destinations loaded yet, dispatching fetchDestinations');
      dispatch({
        type: 'travel/fetchDestinations',
      });
    } else {
      console.log('Destinations already loaded:', destinations.length, 'destinations');
    }
  }, [dispatch, trips.length, destinations.length]);

  useEffect(() => {
    applyFilters();
  }, [destinations, filters]);

  const applyFilters = () => {
    let result = [...destinations];

    // Apply type filter
    if (filters.type) {
      result = result.filter((destination) => destination.type === filters.type);
    }

    // Apply price range filter
    result = result.filter(
      (destination) =>
        destination.price >= filters.priceRange[0] && destination.price <= filters.priceRange[1],
    );

    // Apply rating filter
    if (filters.rating) {
      result = result.filter((destination) => destination.rating >= filters.rating);
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating_desc':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'rating_asc':
          result.sort((a, b) => a.rating - b.rating);
          break;
        default:
          break;
      }
    }

    setFilteredDestinations(result);
  };

  const handleFilter = (values: FilterValues) => {
    setFilters(values);
  };

  const handleCardClick = (destination: Destination) => {
    // In a real app, this would navigate to a destination detail page
    console.log('Clicked destination:', destination);
  };

  const showCreateTripModal = () => {
    setEditingTrip(null);
    setTripName('Chuyến đi mới');
    setIsModalVisible(true);
  };

  const showEditTripModal = (trip: Trip) => {
    setEditingTrip(trip);
    setTripName(trip.name);
    setIsModalVisible(true);
  };

  const handleCreateOrUpdateTrip = () => {
    if (!tripName.trim()) {
      message.error('Vui lòng nhập tên chuyến đi');
      return;
    }

    if (editingTrip) {
      // Cập nhật tên chuyến đi hiện có
      const updatedTrip = { ...editingTrip, name: tripName };
      console.log('Updating trip:', updatedTrip);
      dispatch({
        type: 'travel/saveTrip',
        payload: updatedTrip,
      });
      message.success('Đã cập nhật tên chuyến đi');
    } else {
      // Tạo chuyến đi mới
      const newTrip: Trip = {
        id: generateTripId(),
        name: tripName,
        startDate: '',
        endDate: '',
        items: [],
        budget: {
          food: 0,
          accommodation: 0,
          transportation: 0,
          activities: 0,
          other: 0,
        },
      };
      
      console.log('Creating new trip:', newTrip);
      dispatch({
        type: 'travel/saveTrip',
        payload: newTrip,
      });
      
      // Chuyển đến trang lập lịch trình cho chuyến đi mới
      dispatch({
        type: 'travel/setCurrentTrip',
        payload: newTrip,
      });
      
      // Chuyển hướng đến trang lập kế hoạch
      history.push('/travel-planner/trip');
      
      message.success('Đã tạo chuyến đi mới');
    }
    
    setIsModalVisible(false);
  };

  const handleEditTrip = (trip: Trip) => {
    console.log('Editing trip:', trip);
    dispatch({
      type: 'travel/setCurrentTrip',
      payload: trip,
    });
    history.push('/travel-planner/trip');
  };

  const handleDeleteTrip = (tripId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa chuyến đi này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        console.log('Deleting trip:', tripId);
        dispatch({
          type: 'travel/deleteTrip',
          payload: tripId,
        });
        message.success('Đã xóa chuyến đi');
      },
    });
  };

  const renderTripsList = () => {
    console.log('Rendering trips list, trips:', trips);
    if (!trips || trips.length === 0) {
      return (
        <Empty
          description="Bạn chưa có chuyến đi nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={showCreateTripModal}>
            Tạo chuyến đi mới
          </Button>
        </Empty>
      );
    }

    // Hàm đếm điểm đến theo ngày cho mỗi chuyến đi
    const countDestinationsByDate = (trip: Trip) => {
      if (!trip.items || trip.items.length === 0) return null;
      
      const dateCount = {};
      let totalDates = 0;
      
      trip.items.forEach(item => {
        if (!dateCount[item.date]) {
          dateCount[item.date] = 1;
          totalDates++;
        } else {
          dateCount[item.date]++;
        }
      });
      
      return { 
        dates: totalDates,
        totalDestinations: trip.items.length
      };
    };

    return (
      <div className={styles.tripList}>
        <Row gutter={[16, 16]}>
          {trips.map((trip: Trip) => {
            const destinationStats = countDestinationsByDate(trip);
            
            return (
              <Col xs={24} sm={12} md={8} key={trip.id}>
                <Card
                  title={trip.name}
                  className={styles.tripCard}
                  actions={[
                    <EditOutlined key="edit" onClick={() => handleEditTrip(trip)} />,
                    <FormOutlined key="rename" onClick={() => showEditTripModal(trip)} />,
                    <DeleteOutlined key="delete" onClick={() => handleDeleteTrip(trip.id)} />,
                  ]}
                >
                  <div className={styles.tripInfo}>
                    {trip.startDate && trip.endDate ? (
                      <div>
                        <Text strong>Thời gian: </Text>
                        <Text>
                          {moment(trip.startDate).format('DD/MM/YYYY')} - {moment(trip.endDate).format('DD/MM/YYYY')}
                        </Text>
                      </div>
                    ) : (
                      <Text type="secondary">Chưa thiết lập thời gian</Text>
                    )}

                    <div>
                      <Text strong>Số điểm đến: </Text>
                      <Text>{trip.items.length}</Text>
                      {destinationStats && destinationStats.dates > 0 && (
                        <Text> ({destinationStats.dates} ngày)</Text>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
          <Col xs={24} sm={12} md={8}>
            <Card className={styles.newTripCard} onClick={showCreateTripModal}>
              <PlusOutlined className={styles.plusIcon} />
              <Text>Tạo chuyến đi mới</Text>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Các chuyến đi của tôi" key="1">
          <div className={styles.section}>
            <Title level={2} className={styles.title}>
              Các chuyến đi của tôi
            </Title>
            <Spin spinning={loading}>
              {renderTripsList()}
            </Spin>
          </div>
        </TabPane>
        <TabPane tab="Khám phá điểm đến" key="2">
          <div className={styles.section}>
            <Title level={2} className={styles.title}>
              Khám phá điểm đến
            </Title>

            <DestinationFilter onFilter={handleFilter} initialValues={filters} />

            <Spin spinning={loading}>
              {filteredDestinations.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {filteredDestinations.map((destination) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={destination.id}>
                      <DestinationCard
                        destination={destination}
                        onClick={() => handleCardClick(destination)}
                      />
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty
                  description="Không tìm thấy điểm đến nào phù hợp với bộ lọc"
                  style={{ marginTop: 40 }}
                />
              )}
            </Spin>
          </div>
        </TabPane>
      </Tabs>

      <Modal
        title={editingTrip ? "Đổi tên chuyến đi" : "Tạo chuyến đi mới"}
        visible={isModalVisible}
        onOk={handleCreateOrUpdateTrip}
        onCancel={() => setIsModalVisible(false)}
        okText={editingTrip ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Tên chuyến đi:</Text>
          <Input
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="Nhập tên chuyến đi"
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>

      <BackTop>
        <div className={styles.backTop}>
          <UpOutlined />
        </div>
      </BackTop>
    </div>
  );
};

export default HomePage; 