import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'umi';
import { Typography, Card, message, Spin } from 'antd';
import { Destination } from '@/models/travel';
import AdminPanel from '@/components/TravelPlanner/AdminPanel';
import styles from './index.less';

const { Title } = Typography;

const AdminPage: React.FC = () => {
  const dispatch = useDispatch();
  const { destinations, trips, loading } = useSelector((state: any) => state.travel);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch({
      type: 'travel/fetchDestinations',
    });
    
    dispatch({
      type: 'travel/fetchTrips',
    });
  }, [dispatch]);

  const handleAddDestination = (destination: Destination) => {
    setIsSubmitting(true);
    const updatedDestinations = [...destinations, destination];
    
    dispatch({
      type: 'travel/saveDestinations',
      payload: updatedDestinations,
    });
    
    dispatch({
      type: 'travel/fetchTrips',
    });
    
    message.success('Đã thêm điểm đến mới thành công');
    setIsSubmitting(false);
  };

  const handleUpdateDestination = (destination: Destination) => {
    setIsSubmitting(true);
    const updatedDestinations = destinations.map((item: Destination) =>
      item.id === destination.id ? destination : item,
    );
    
    dispatch({
      type: 'travel/saveDestinations',
      payload: updatedDestinations,
    });
    
    dispatch({
      type: 'travel/fetchTrips',
    });
    
    message.success('Đã cập nhật điểm đến thành công');
    setIsSubmitting(false);
  };

  const handleDeleteDestination = (id: string) => {
    setIsSubmitting(true);
    const filteredDestinations = destinations.filter((item: Destination) => item.id !== id);
    
    dispatch({
      type: 'travel/saveDestinations',
      payload: filteredDestinations,
    });
    
    message.success('Đã xóa điểm đến thành công');
    setIsSubmitting(false);
  };

  return (
    <div className={styles.container}>
      <Title level={2} className={styles.title}>
        Trang quản trị
      </Title>
      
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <AdminPanel
            destinations={destinations}
            trips={trips || []}
            onAddDestination={handleAddDestination}
            onUpdateDestination={handleUpdateDestination}
            onDeleteDestination={handleDeleteDestination}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminPage; 