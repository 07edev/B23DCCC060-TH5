import React from 'react';
import { Card, Rate, Tag, Typography, Space } from 'antd';
import { DestinationType, Destination } from '@/models/travel';
import { formatCurrency } from '@/utils/travel';
import styles from './index.less';

const { Meta } = Card;
const { Paragraph } = Typography;

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
}

const getTypeColor = (type: DestinationType): string => {
  switch (type) {
    case DestinationType.BEACH:
      return '#1890ff';
    case DestinationType.MOUNTAIN:
      return '#52c41a';
    case DestinationType.CITY:
      return '#722ed1';
    default:
      return '#d9d9d9';
  }
};

const getTypeLabel = (type: DestinationType): string => {
  switch (type) {
    case DestinationType.BEACH:
      return 'Biển';
    case DestinationType.MOUNTAIN:
      return 'Núi';
    case DestinationType.CITY:
      return 'Thành phố';
    default:
      return 'Khác';
  }
};

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onClick }) => {
  return (
    <Card
      hoverable
      className={styles.destinationCard}
      cover={<img alt={destination.name} src={destination.image} className={styles.cardImage} />}
      onClick={onClick}
      actions={[
        <div key="price" className={styles.cardAction}>
          <span>Giá: {formatCurrency(destination.price)}</span>
        </div>,
        <div key="rating" className={styles.cardAction}>
          <Rate disabled defaultValue={destination.rating} allowHalf className={styles.rating} />
        </div>,
      ]}
    >
      <Meta
        title={destination.name}
        description={
          <Space direction="vertical" size="small">
            <Tag color={getTypeColor(destination.type)}>
              {getTypeLabel(destination.type)}
            </Tag>
            <Paragraph ellipsis={{ rows: 2 }} className={styles.description}>
              {destination.description}
            </Paragraph>
          </Space>
        }
      />
    </Card>
  );
};

export default DestinationCard; 