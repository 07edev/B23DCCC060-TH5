import React from 'react';
import { useDispatch, useSelector } from 'umi';
import { Typography, Row, Col, Spin, Button, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { Trip } from '@/models/travel';
import TripItinerary from '@/components/TravelPlanner/TripItinerary';
import BudgetManager from '@/components/TravelPlanner/BudgetManager';
import { createDefaultTrip } from '@/utils/travel';
import styles from './index.less';

const { Title } = Typography;

const TripPage: React.FC = () => {
  const dispatch = useDispatch();
  const { destinations, currentTrip, loading } = useSelector((state: any) => state.travel);

  React.useEffect(() => {
    // Fetch destinations if not already loaded
    if (destinations.length === 0) {
      console.log('Fetching destinations');
      dispatch({
        type: 'travel/fetchDestinations',
      });
    }

    // Initialize current trip if not exists
    if (!currentTrip) {
      console.log('Creating default trip');
      const defaultTrip = createDefaultTrip();
      console.log('Default trip:', defaultTrip);
      dispatch({
        type: 'travel/setCurrentTrip',
        payload: defaultTrip,
      });
    } else {
      console.log('Current trip loaded:', currentTrip);
    }
  }, [dispatch, destinations.length, currentTrip]);

  const handleTripChange = (updatedTrip: Trip) => {
    console.log('Trip updated:', updatedTrip);
    
    // Cập nhật trip trong state
    dispatch({
      type: 'travel/setCurrentTrip',
      payload: updatedTrip,
    });
    
    // Tự động lưu chuyến đi khi có sự thay đổi
    dispatch({
      type: 'travel/saveTrip',
      payload: updatedTrip,
    });
    
    // Hiển thị thông báo nhỏ khi lưu thành công
    message.success({
      content: 'Đã cập nhật lịch trình',
      duration: 1,
      key: 'trip-update'
    });
  };

  const handleBudgetChange = (budget: any) => {
    if (currentTrip) {
      console.log('Budget updated:', budget);
      
      // Cập nhật budget trong currentTrip
      const updatedTrip = {
        ...currentTrip,
        budget: budget
      };
      
      // Cập nhật trip trong state
      dispatch({
        type: 'travel/setCurrentTrip',
        payload: updatedTrip,
      });
      
      // Tự động lưu chuyến đi khi có sự thay đổi ngân sách
      dispatch({
        type: 'travel/saveTrip',
        payload: updatedTrip,
      });
      
      // Hiển thị thông báo nhỏ khi lưu thành công
      message.success({
        content: 'Đã cập nhật ngân sách',
        duration: 1,
        key: 'budget-update'
      });
    }
  };

  const handleSaveTrip = () => {
    if (currentTrip) {
      console.log('Saving trip:', currentTrip);
      dispatch({
        type: 'travel/saveTrip',
        payload: currentTrip,
      });
      message.success('Lịch trình đã được lưu thành công!');
    }
  };

  if (!currentTrip) {
    console.log('No current trip, showing spinner');
    return <Spin size="large" />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          Lập kế hoạch du lịch
        </Title>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSaveTrip}
          size="large"
        >
          Lưu lịch trình
        </Button>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <TripItinerary
            trip={currentTrip}
            destinations={destinations}
            loading={loading}
            onChange={handleTripChange}
          />
        </Col>
        <Col xs={24} lg={8}>
          <BudgetManager
            trip={currentTrip}
            destinations={destinations}
            onChange={handleBudgetChange}
          />
        </Col>
      </Row>
    </div>
  );
};

export default TripPage; 