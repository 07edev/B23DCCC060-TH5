import React, { useEffect, useState } from 'react';
import { Typography, Card, InputNumber, Alert, Row, Col, notification } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Budget, Trip, Destination } from '@/models/travel';
import { calculateTotalBudget, formatCurrency, getDestinationById } from '@/utils/travel';
import styles from './index.less';

const { Title, Text } = Typography;

interface BudgetManagerProps {
  trip: Trip;
  destinations: Destination[];
  onChange: (budget: Budget) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({
  trip,
  destinations,
  onChange,
}) => {
  const [totalDestinationsPrice, setTotalDestinationsPrice] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  
  const totalBudget = calculateTotalBudget(trip.budget);
  
  // Calculate total price of all destinations in the trip
  useEffect(() => {
    let total = 0;
    
    trip.items.forEach((item) => {
      const destination = getDestinationById(destinations, item.destinationId);
      if (destination) {
        total += destination.price;
      }
    });
    
    setTotalDestinationsPrice(total);
    
    // Check if budget is less than destinations price
    const isBudgetInsufficient = totalBudget < total;
    setShowWarning(isBudgetInsufficient);
    
    if (isBudgetInsufficient && totalBudget > 0) {
      notification.warning({
        message: 'Cảnh báo ngân sách',
        description: 'Ngân sách của bạn thấp hơn tổng chi phí các điểm đến!',
        duration: 4,
      });
    }
  }, [trip.items, trip.budget, destinations, totalBudget]);

  const handleBudgetChange = (category: keyof Budget, value: number | null) => {
    onChange({
      ...trip.budget,
      [category]: value || 0,
    });
  };

  // Prepare chart data
  const chartSeries = [
    trip.budget.food,
    trip.budget.accommodation,
    trip.budget.transportation,
    trip.budget.activities,
    trip.budget.other,
  ];
  
  const chartOptions: ApexOptions = {
    labels: ['Ăn uống', 'Lưu trú', 'Di chuyển', 'Hoạt động', 'Khác'],
    colors: ['#1890ff', '#52c41a', '#722ed1', '#faad14', '#f5222d'],
    legend: {
      position: 'bottom',
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  return (
    <div className={styles.budgetContainer}>
      <Title level={4}>
        <WalletOutlined style={{ marginRight: 8 }} />
        Quản lý ngân sách
      </Title>

      {showWarning && (
        <Alert
          message="Cảnh báo ngân sách"
          description="Ngân sách của bạn thấp hơn tổng chi phí các điểm đến!"
          type="warning"
          showIcon
          className={styles.budgetAlert}
        />
      )}

      <Card title="Chi phí các hạng mục" bordered={false} style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text>Ăn uống</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 8 }}
              min={0}
              step={100000}
              value={trip.budget.food}
              onChange={(value) => handleBudgetChange('food', value)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\s?|(,*)/g, ''))}
              addonAfter="VND"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text>Lưu trú</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 8 }}
              min={0}
              step={100000}
              value={trip.budget.accommodation}
              onChange={(value) => handleBudgetChange('accommodation', value)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\s?|(,*)/g, ''))}
              addonAfter="VND"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text>Di chuyển</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 8 }}
              min={0}
              step={100000}
              value={trip.budget.transportation}
              onChange={(value) => handleBudgetChange('transportation', value)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\s?|(,*)/g, ''))}
              addonAfter="VND"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text>Hoạt động</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 8 }}
              min={0}
              step={100000}
              value={trip.budget.activities}
              onChange={(value) => handleBudgetChange('activities', value)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\s?|(,*)/g, ''))}
              addonAfter="VND"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text>Khác</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 8 }}
              min={0}
              step={100000}
              value={trip.budget.other}
              onChange={(value) => handleBudgetChange('other', value)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\s?|(,*)/g, ''))}
              addonAfter="VND"
            />
          </Col>
        </Row>

        <div className={styles.totalBudget}>
          <Text>Chi phí điểm đến: {formatCurrency(totalDestinationsPrice)}</Text>
          <br />
          <Text>Tổng ngân sách: {formatCurrency(totalBudget)}</Text>
        </div>
      </Card>

      {totalBudget > 0 && (
        <Card title="Phân bổ ngân sách" bordered={false} style={{ marginTop: 16 }}>
          <div className={styles.chartContainer}>
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="pie"
              height={350}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default BudgetManager; 