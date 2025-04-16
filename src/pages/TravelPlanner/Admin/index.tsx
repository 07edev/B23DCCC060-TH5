import React from 'react';
import { useDispatch, useSelector } from 'umi';
import { Typography, Card } from 'antd';
import { Destination } from '@/models/travel';
import AdminPanel from '@/components/TravelPlanner/AdminPanel';
import styles from './index.less';

const { Title } = Typography;

const AdminPage: React.FC = () => {
  const dispatch = useDispatch();
  const { destinations } = useSelector((state: any) => state.travel);

  const handleAddDestination = (destination: Destination) => {
    dispatch({
      type: 'travel/setDestinations',
      payload: [...destinations, destination],
    });
  };

  const handleUpdateDestination = (destination: Destination) => {
    const updatedDestinations = destinations.map((item: Destination) =>
      item.id === destination.id ? destination : item,
    );
    
    dispatch({
      type: 'travel/setDestinations',
      payload: updatedDestinations,
    });
  };

  const handleDeleteDestination = (id: string) => {
    const filteredDestinations = destinations.filter((item: Destination) => item.id !== id);
    
    dispatch({
      type: 'travel/setDestinations',
      payload: filteredDestinations,
    });
  };

  return (
    <div className={styles.container}>
      <Title level={2} className={styles.title}>
        Trang quản trị
      </Title>
      
      <Card>
        <AdminPanel
          destinations={destinations}
          onAddDestination={handleAddDestination}
          onUpdateDestination={handleUpdateDestination}
          onDeleteDestination={handleDeleteDestination}
        />
      </Card>
    </div>
  );
};

export default AdminPage; 