import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'umi';
import { Typography, Row, Col, Spin, Button, message, DatePicker, Card, Empty } from 'antd';
import { SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import { Trip } from '@/models/travel';
import TripItinerary from '@/components/TravelPlanner/TripItinerary';
import BudgetManager from '@/components/TravelPlanner/BudgetManager';
import { createDefaultTrip, generateTripId } from '@/utils/travel';
import moment from 'moment';
import styles from './index.less';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TripPage: React.FC = () => {
  const dispatch = useDispatch();
  const { destinations, currentTrip, loading } = useSelector((state: any) => state.travel);
  const [dateSelected, setDateSelected] = useState(false);

  useEffect(() => {
    // Fetch destinations if not already loaded
    if (destinations.length === 0) {
      dispatch({
        type: 'travel/fetchDestinations',
      });
    }

    // Initialize empty trip if not exists
    if (!currentTrip) {
      dispatch({
        type: 'travel/setCurrentTrip',
        payload: {
          id: generateTripId(),
          name: 'Chuyến đi mới',
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
        },
      });
    } else if (currentTrip.startDate && currentTrip.endDate) {
      setDateSelected(true);
    }
  }, [dispatch, destinations.length, currentTrip]);

  const handleTripChange = (updatedTrip: Trip) => {
    dispatch({
      type: 'travel/setCurrentTrip',
      payload: updatedTrip,
    });
  };

  const handleBudgetChange = (budget: any) => {
    if (currentTrip) {
      dispatch({
        type: 'travel/updateCurrentTrip',
        payload: {
          budget,
        },
      });
    }
  };

  const handleSaveTrip = () => {
    if (currentTrip) {
      dispatch({
        type: 'travel/saveTrip',
        payload: currentTrip,
      });
      message.success('Lịch trình đã được lưu thành công!');
    }
  };

  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const startDate = dates[0].format('YYYY-MM-DD');
      const endDate = dates[1].format('YYYY-MM-DD');
      
      if (currentTrip) {
        dispatch({
          type: 'travel/updateCurrentTrip',
          payload: {
            startDate,
            endDate,
          },
        });
        setDateSelected(true);
      }
    }
  };

  if (!currentTrip) {
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
          disabled={!dateSelected}
        >
          Lưu lịch trình
        </Button>
      </div>

      {!dateSelected ? (
        <Card className={styles.dateSelectionCard}>
          <div className={styles.dateSelectionContent}>
            <CalendarOutlined className={styles.calendarIcon} />
            <Title level={4}>Chọn thời gian cho chuyến đi của bạn</Title>
            <Text>Vui lòng chọn ngày bắt đầu và kết thúc cho chuyến đi:</Text>
            <RangePicker
              className={styles.datePicker}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
            />
          </div>
        </Card>
      ) : (
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
      )}
    </div>
  );
};

export default TripPage; 